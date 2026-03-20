const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #F3F4F6;
      color: #111827;
      font-family: 'Nunito', system-ui, -apple-system, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .mm-input {
      width: 100%;
      height: 44px;
      padding: 0 13px;
      background: #fff;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      font-family: inherit;
      font-size: 15px;
      color: #111827;
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
      appearance: none;
      -webkit-appearance: none;
    }
    .mm-input::placeholder { color: #9CA3AF; }
    .mm-input:hover { border-color: #9CA3AF; }
    .mm-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .mm-input::-webkit-inner-spin-button { -webkit-appearance: none; }
    .mm-input::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }

    .mm-select-wrap { position: relative; }
    .mm-select-wrap::after {
      content: '';
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 0; height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid #6B7280;
      pointer-events: none;
    }
    .mm-select-wrap select { padding-right: 32px; cursor: pointer; }

    .btn-primary {
      display: block;
      width: 100%;
      height: 46px;
      padding: 0 20px;
      background: #2563EB;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms, box-shadow 150ms;
      touch-action: manipulation;
    }
    .btn-primary:hover:not(:disabled) { background: #1D4ED8; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
    .btn-primary:active:not(:disabled) { background: #1E40AF; }
    .btn-primary:disabled { background: #93C5FD; cursor: not-allowed; }
    .btn-primary:focus-visible { outline: 2px solid #2563EB; outline-offset: 2px; }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 14px;
      background: #fff;
      color: #374151;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 150ms, border-color 150ms;
      touch-action: manipulation;
    }
    .btn-secondary:hover { background: #F9FAFB; border-color: #9CA3AF; }
    .btn-secondary:focus-visible { outline: 2px solid #2563EB; outline-offset: 2px; }

    .btn-ghost {
      display: block;
      width: 100%;
      height: 46px;
      background: #fff;
      color: #2563EB;
      border: 1px solid #BFDBFE;
      border-radius: 6px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms, border-color 150ms;
      touch-action: manipulation;
    }
    .btn-ghost:hover { background: #EFF6FF; border-color: #93C5FD; }

    .event-card-input { display: none; }
    .event-card-surface {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      cursor: pointer;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      background: #fff;
      transition: border-color 150ms, background 150ms;
      user-select: none;
    }
    .event-card-surface:hover { border-color: #93C5FD; background: #F8FAFF; }
    .event-card-input:checked + .event-card-surface { border-color: #2563EB; background: #EFF6FF; }

    .waiver-input { display: none; }
    .waiver-label-wrap { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
    .waiver-box {
      flex-shrink: 0; width: 18px; height: 18px;
      border: 1.5px solid #D1D5DB; border-radius: 4px; background: #fff;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1px; transition: all 150ms;
    }
    .waiver-box svg { display: none; }
    .waiver-input:checked ~ .waiver-label-wrap .waiver-box { background: #2563EB; border-color: #2563EB; }
    .waiver-input:checked ~ .waiver-label-wrap .waiver-box svg { display: block; }
  `}</style>
);

export default FontLoader;
