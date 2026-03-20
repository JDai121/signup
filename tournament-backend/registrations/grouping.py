"""
Taekwondo Tournament Grouping Algorithm
----------------------------------------
Matched to your TournamentRegistration model.

Add to urls.py:
    from .grouping import get_tournament_groups
    path('api/groups/', get_tournament_groups),
"""

from datetime import date
from itertools import groupby

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import TournamentRegistration


# ── Belt rank order (matches your BELT_CHOICES exactly) ───────────────────────
BELT_ORDER = [
    "white",
    "yellow",
    "green",
    "blue",
    "red",
    "black",
    "black-dan2",
    "black-dan3",
]

# ── Age brackets ──────────────────────────────────────────────────────────────
AGE_BRACKETS = [
    (4,  7,  "Tiny Tiger (4-7)"),
    (8,  10, "Junior (8-10)"),
    (11, 13, "Youth (11-13)"),
    (14, 17, "Cadet (14-17)"),
    (18, 99, "Adult (18+)"),
]

# ── Weight classes (lbs) ──────────────────────────────────────────────────────
WEIGHT_CLASSES = [
    (0,   30,  "Under 30 lbs"),
    (30,  50,  "30-50 lbs"),
    (50,  70,  "50-70 lbs"),
    (70,  90,  "70-90 lbs"),
    (90,  110, "90-110 lbs"),
    (110, 130, "110-130 lbs"),
    (130, 999, "130+ lbs"),
]

TARGET_GROUP_SIZE = 4  # Aim for groups of 3-5; stragglers merged in


# ── Helpers ───────────────────────────────────────────────────────────────────

def belt_rank(belt_name):
    try:
        return BELT_ORDER.index(belt_name.lower().strip())
    except ValueError:
        return len(BELT_ORDER)


def calculate_age(date_of_birth):
    today = date.today()
    return today.year - date_of_birth.year - (
        (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
    )


def get_age_bracket(age):
    for low, high, label in AGE_BRACKETS:
        if low <= age <= high:
            return label
    return "Unknown Age"


def get_weight_class(weight):
    for low, high, label in WEIGHT_CLASSES:
        if low <= weight < high:
            return label
    return "Unknown Weight"


def score_school_diversity(group):
    """Lower score = more school diversity (0 is perfect)."""
    schools = [c["school_name"] for c in group]
    return sum(schools.count(s) - 1 for s in set(schools) if schools.count(s) > 1)


# ── Core grouping logic ───────────────────────────────────────────────────────

def split_into_groups(competitors, target_size=TARGET_GROUP_SIZE):
    """Chunk a list into groups of ~target_size, then optimize school diversity."""
    if not competitors:
        return []

    sorted_comps = sorted(competitors, key=lambda c: c["weight"])
    groups = [sorted_comps[i:i + target_size] for i in range(0, len(sorted_comps), target_size)]

    # Merge tiny last group (< 3) into the previous one
    if len(groups) > 1 and len(groups[-1]) < 3:
        last = groups.pop()
        groups[-1].extend(last)

    return optimize_school_diversity(groups)


def optimize_school_diversity(groups, max_passes=10):
    """Swap competitors between groups to reduce same-school matchups."""
    for _ in range(max_passes):
        improved = False
        for i, group_a in enumerate(groups):
            for competitor in group_a:
                school = competitor["school_name"]
                if [c["school_name"] for c in group_a].count(school) <= 1:
                    continue

                best_swap, best_diff = None, float("inf")

                for j, group_b in enumerate(groups):
                    if i == j:
                        continue
                    for candidate in group_b:
                        if candidate["school_name"] == school:
                            continue
                        test_b = [c for c in group_b if c != candidate] + [competitor]
                        if score_school_diversity(test_b) > score_school_diversity(group_b):
                            continue
                        diff = abs(competitor["weight"] - candidate["weight"])
                        if diff < best_diff:
                            best_diff = diff
                            best_swap = (j, candidate)

                if best_swap:
                    j, candidate = best_swap
                    groups[i] = [c for c in groups[i] if c != competitor] + [candidate]
                    groups[j] = [c for c in groups[j] if c != candidate] + [competitor]
                    improved = True
                    break
            if improved:
                break
        if not improved:
            break

    return groups


def group_competitors(competitors):
    results = []

    # Sort by gender first
    gender_sorted = sorted(competitors, key=lambda c: c["gender"])

    for gender, gender_group in groupby(gender_sorted, key=lambda c: c["gender"]):
        belt_sorted = sorted(gender_group, key=lambda c: belt_rank(c["belt_rank"]))

        for belt, belt_group in groupby(belt_sorted, key=lambda c: c["belt_rank"]):
            age_sorted = sorted(belt_group, key=lambda c: c["age"])

            for age_label, age_group in groupby(age_sorted, key=lambda c: get_age_bracket(c["age"])):
                weight_sorted = sorted(age_group, key=lambda c: c["weight"])

                for weight_label, weight_group in groupby(weight_sorted, key=lambda c: get_weight_class(c["weight"])):
                    weight_list = list(weight_group)
                    if not weight_list:
                        continue

                    groups = split_into_groups(weight_list)
                    division_name = f"{gender.title()} | {belt.replace('-', ' ').title()} | {age_label} | {weight_label}"

                    results.append({
                        "division": division_name,
                        "belt": belt,
                        "gender": gender,
                        "age_bracket": age_label,
                        "weight_class": weight_label,
                        "competitor_count": len(weight_list),
                        "group_count": len(groups),
                        "groups": [
                            [
                                {
                                    "id": c["id"],
                                    "name": f"{c['first_name']} {c['last_name']}",
                                    "age": c["age"],
                                    "weight": c["weight"],
                                    "school_name": c["school_name"],
                                    "gender": c["gender"],
                                }
                                for c in group
                            ]
                            for group in groups
                        ],
                    })

    return results


# ── Django API View ───────────────────────────────────────────────────────────

@api_view(["GET"])
def get_tournament_groups(request):
    """
    GET /api/groups/                      -> all three events
    GET /api/groups/?event=sparring       -> sparring only
    GET /api/groups/?event=poomsae        -> poomsae only
    GET /api/groups/?event=board_breaking -> board breaking only
    """
    event_filter = request.query_params.get("event")

    # Only include paid registrations
    qs = TournamentRegistration.objects.filter(payment_status="succeeded")

    if event_filter == "sparring":
        qs = qs.filter(sparring=True)
    elif event_filter == "poomsae":
        qs = qs.filter(poomsae=True)
    elif event_filter == "board_breaking":
        qs = qs.filter(board_breaking=True)

    raw = list(qs.values(
        "id", "first_name", "last_name", "date_of_birth",
        "gender", "belt_rank", "weight", "school_name",
        "poomsae", "sparring", "board_breaking",
    ))

    # Calculate age from date_of_birth
    for r in raw:
        r["age"] = calculate_age(r["date_of_birth"])

    if not event_filter:
        response_data = {}
        for event in ["poomsae", "sparring", "board_breaking"]:
            event_competitors = [r for r in raw if r[event]]
            response_data[event] = group_competitors(event_competitors)
        return Response(response_data)
    else:
        return Response({event_filter: group_competitors(raw)})
