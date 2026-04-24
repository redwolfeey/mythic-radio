import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slide } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import Nui from '../../util/Nui';
import radioImg from '../../radio.png';
import badRadioImg from '../../bad_radio.png';

const isDev = process.env.NODE_ENV === 'development';

const radioTypeLayouts = {
  1: {
    main: { top: 243, left: 87, width: 142, height: 155 },
    knobs: {
      volumeDown: { top: 438, left: 180, width: 41, height: 36 },
      volumeUp: { top: 443, left: 92, width: 36, height: 25 },
      power: { top: 160, left: 180, width: 76, height: 38 },
    },
  },
  2: {
    main: { top: 252, left: 49, width: 152, height: 126 },
    knobs: {
      volumeDown: { top: 369, left: 55, width: 37, height: 42 },
      volumeUp: { top: 369, left: 156, width: 39, height: 42 },
      power: { top: 152, left: 33, width: 71, height: 71 },
      set: { top: 377, left: 99, width: 48, height: 42 },
    },
  },
};

const loadLayout = radioType => {
  const defaults = radioTypeLayouts[radioType] || radioTypeLayouts[1];
  if (!isDev) return { main: defaults.main, knobs: defaults.knobs };
  try {
    const saved = window.localStorage.getItem(
      `mythic_radio_layout_${radioType}`,
    );
    if (!saved) return { main: defaults.main, knobs: defaults.knobs };
    const parsed = JSON.parse(saved);
    return {
      main: { ...defaults.main, ...parsed.main },
      knobs: {
        volumeDown: {
          ...defaults.knobs.volumeDown,
          ...parsed.knobs?.volumeDown,
        },
        volumeUp: {
          ...defaults.knobs.volumeUp,
          ...parsed.knobs?.volumeUp,
        },
        power: { ...defaults.knobs.power, ...parsed.knobs?.power },
        ...(defaults.knobs.set
          ? { set: { ...defaults.knobs.set, ...parsed.knobs?.set } }
          : {}),
      },
    };
  } catch (err) {
    return { main: defaults.main, knobs: defaults.knobs };
  }
};

const useStyles = makeStyles(() => ({
  wrapper: {
    fontFamily: 'Oswald, sans-serif',
    height: '100vh',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    right: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    pointerEvents: 'none',
  },
  radioShell: {
    position: 'relative',
    width: 320,
    height: 600,
    marginRight: '2vw',
    marginBottom: 0,
    pointerEvents: 'auto',
  },
  radioImg: {
    zIndex: 1,
    background: 'transparent no-repeat center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  knobHitbox: {
    position: 'absolute',
    zIndex: 3,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  debugKnob: {
    background: 'rgba(78, 100, 255, 0.2)',
    border: '1px dashed #4e64ff',
  },
  debugPowerKnob: {
    background: 'rgba(27, 218, 49, 0.2)',
    borderColor: '#1bda31',
  },
  radioMain: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 8,
    background: 'linear-gradient(180deg, #1d1d1d 0%, #191919 100%)',
    border: '1px solid #252525',
    boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
    padding: '10px 11px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 18,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  center: {
    flex: 1,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  frequencyBox: {
    width: '100%',
    height: 48,
    background: 'linear-gradient(180deg, #2a2a2a 0%, #212121 100%)',
    border: '1px solid #252525',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
  },
  frequencyInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 1,
    letterSpacing: '0.04em',
    fontWeight: 500,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.32)',
    },
    '&:disabled': {
      color: 'rgba(255, 255, 255, 0.32)',
    },
  },
  actionButton: {
    width: '100%',
    height: 24,
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontFamily: 'Oswald, sans-serif',
    fontSize: 11,
    transition: 'filter 0.2s ease, transform 0.2s ease',
    '&:hover': {
      filter: 'brightness(1.08)',
    },
    '&:active': {
      transform: 'translateY(1px)',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  connectButton: {
    background: 'linear-gradient(180deg, #3443a4 0%, #1f265b 100%)',
    color: '#4e64ff',
  },
  channelText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 1.15,
    textAlign: 'center',
    minHeight: 18,
  },
  debugPanel: {
    position: 'absolute',
    zIndex: 5,
    left: -286,
    bottom: 8,
    width: 270,
    maxHeight: 580,
    overflowY: 'auto',
    background: 'rgba(18, 18, 18, 0.92)',
    border: '1px solid #303030',
    borderRadius: 8,
    padding: 10,
    color: '#f1f1f1',
    pointerEvents: 'auto',
  },
  debugTitle: {
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  debugRow: {
    display: 'grid',
    gridTemplateColumns: '56px 1fr 46px',
    gap: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  debugLabel: {
    fontSize: 10,
    color: '#adadad',
    textTransform: 'uppercase',
  },
  debugInput: {
    width: '100%',
  },
  debugValue: {
    textAlign: 'right',
    fontSize: 11,
  },
  debugSection: {
    borderTop: '1px solid #2e2e2e',
    paddingTop: 8,
    marginTop: 8,
  },
  debugSectionTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#8db0ff',
    marginBottom: 6,
  },
  debugActions: {
    display: 'flex',
    gap: 6,
    marginTop: 10,
  },
  debugButton: {
    flex: 1,
    height: 26,
    border: '1px solid #363636',
    background: '#1f1f1f',
    color: '#efefef',
    cursor: 'pointer',
    borderRadius: 4,
    fontSize: 11,
  },
}));

const volumeUp = () => {
  Nui.send('VolumeUp', {});
};

const volumeDown = () => {
  Nui.send('VolumeDown', {});
};

const powerToggle = () => {
  Nui.send('TogglePower', {});
};

export default () => {
  const hidden = useSelector(state => state.app.hidden);
  const power = useSelector(state => state.app.power);
  const frequency = useSelector(state => state.app.frequency);
  const volume = useSelector(state => state.app.volume);
  const freqName = useSelector(state => state.app.frequencyName);
  const radioType = useSelector(state => state.app.radioType);
  const currentRadioImg = radioType === 2 ? badRadioImg : radioImg;
  const classes = useStyles({ power });
  const [freq, setFreq] = useState(frequency);
  const [showDebug, setShowDebug] = useState(isDev);
  const [layout, setLayout] = useState(() => loadLayout(radioType));
  const dragRef = useRef(null);
  const lastDraggedRef = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setLayout(loadLayout(radioType));
  }, [radioType]);

  useEffect(() => {
    if (!isDev) {
      return;
    }

    window.localStorage.setItem(
      `mythic_radio_layout_${radioType}`,
      JSON.stringify(layout),
    );
  }, [layout, radioType]);

  const channelLabel = useMemo(() => {
    if (!power) {
      return 'Powered Off';
    }

    if (frequency <= 0) {
      return 'No Active Channel';
    }

    return freqName === '' ? `Channel #${frequency}` : freqName;
  }, [freqName, frequency, power]);

  const onChange = e => {
    setFreq(e.target.value);
  };

  const setChannel = e => {
    if (e && e.preventDefault) e.preventDefault();
    Nui.send('SetChannel', {
      frequency: freq,
    });
  };

  const updateLayout = (section, field, nextValue) => {
    if (section === 'main') {
      setLayout(prev => ({
        ...prev,
        main: { ...prev.main, [field]: Number(nextValue) },
      }));
    } else {
      setLayout(prev => ({
        ...prev,
        knobs: {
          ...prev.knobs,
          [section]: { ...prev.knobs[section], [field]: Number(nextValue) },
        },
      }));
    }
  };

  const resetLayout = () => {
    const defaults = radioTypeLayouts[radioType] || radioTypeLayouts[1];
    setLayout({ main: defaults.main, knobs: defaults.knobs });
  };

  const copyLayout = () => {
    const text = `// Radio Type ${radioType}\n${JSON.stringify(layout, null, 2)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      window.prompt('Copy this layout:', text);
    }
  };

  const toggleDevRadioType = () => {
    const next = radioType === 1 ? 2 : 1;
    dispatch({
      type: 'UPDATE_DATA',
      payload: {
        frequency: 0,
        frequencyName: '',
        power: true,
        volume: 100,
        typeName: next === 2 ? 'P6900 Radio' : 'Encrypted Radio',
        radioType: next,
      },
    });
  };

  const startDrag = section => e => {
    if (!showDebug) return;
    e.preventDefault();
    e.stopPropagation();
    const cur = section === 'main' ? layout.main : layout.knobs[section];
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origTop: cur.top,
      origLeft: cur.left,
    };
    const onMove = ev => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) lastDraggedRef.current = true;
      updateLayout(section, 'top', dragRef.current.origTop + dy);
      updateLayout(section, 'left', dragRef.current.origLeft + dx);
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startResize = section => e => {
    if (!showDebug) return;
    e.preventDefault();
    e.stopPropagation();
    const cur = section === 'main' ? layout.main : layout.knobs[section];
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origWidth: cur.width,
      origHeight: cur.height,
    };
    const onMove = ev => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      updateLayout(section, 'width', Math.max(8, dragRef.current.origWidth + dx));
      updateLayout(section, 'height', Math.max(8, dragRef.current.origHeight + dy));
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const knobRadius = knobKey => {
    if (knobKey === 'volumeDown') {
      return '14px 0 0 14px';
    }

    if (knobKey === 'volumeUp') {
      return '0 14px 14px 0';
    }

    return 16;
  };

  const knobStyle = knobKey => ({
    top: layout.knobs[knobKey].top,
    left: layout.knobs[knobKey].left,
    width: layout.knobs[knobKey].width,
    height: layout.knobs[knobKey].height,
    borderRadius: knobRadius(knobKey),
  });

  const debugGroups = [
    { section: 'main', label: 'Main Panel' },
    { section: 'volumeDown', label: 'Volume Down' },
    { section: 'volumeUp', label: 'Volume Up' },
    { section: 'power', label: 'Power' },
    ...(layout.knobs.set ? [{ section: 'set', label: 'Set Channel' }] : []),
  ];

  return (
    <Slide direction="up" in={!hidden} mountOnEnter unmountOnExit>
      <div className={classes.wrapper}>
        <div className={classes.radioShell} style={radioType === 2 ? { width: 247 } : undefined}>
          <img className={classes.radioImg} src={currentRadioImg} alt="" style={{ zIndex: 3 }} />
          <button
            type="button"
            aria-label="Volume down knob"
            title={showDebug ? 'Drag to move · corner to resize' : 'Turn Down Volume'}
            className={`${classes.knobHitbox} ${showDebug ? classes.debugKnob : ''}`}
            style={{ ...knobStyle('volumeDown'), cursor: showDebug ? 'move' : 'pointer' }}
            onMouseDown={showDebug ? startDrag('volumeDown') : undefined}
            onClick={() => {
              if (lastDraggedRef.current) { lastDraggedRef.current = false; return; }
              volumeDown();
            }}
          />
          {showDebug && (
            <div
              aria-hidden="true"
              title="Resize"
              style={{
                position: 'absolute',
                zIndex: 4,
                top: layout.knobs.volumeDown.top + layout.knobs.volumeDown.height - 5,
                left: layout.knobs.volumeDown.left + layout.knobs.volumeDown.width - 5,
                width: 12,
                height: 12,
                background: '#4e64ff',
                cursor: 'se-resize',
                borderRadius: 2,
              }}
              onMouseDown={startResize('volumeDown')}
            />
          )}
          <button
            type="button"
            aria-label="Volume up knob"
            title={showDebug ? 'Drag to move · corner to resize' : 'Turn Up Volume'}
            className={`${classes.knobHitbox} ${showDebug ? classes.debugKnob : ''}`}
            style={{ ...knobStyle('volumeUp'), cursor: showDebug ? 'move' : 'pointer' }}
            onMouseDown={showDebug ? startDrag('volumeUp') : undefined}
            onClick={() => {
              if (lastDraggedRef.current) { lastDraggedRef.current = false; return; }
              volumeUp();
            }}
          />
          {showDebug && (
            <div
              aria-hidden="true"
              title="Resize"
              style={{
                position: 'absolute',
                zIndex: 4,
                top: layout.knobs.volumeUp.top + layout.knobs.volumeUp.height - 5,
                left: layout.knobs.volumeUp.left + layout.knobs.volumeUp.width - 5,
                width: 12,
                height: 12,
                background: '#4e64ff',
                cursor: 'se-resize',
                borderRadius: 2,
              }}
              onMouseDown={startResize('volumeUp')}
            />
          )}
          <button
            type="button"
            aria-label="Power knob"
            title={showDebug ? 'Drag to move · corner to resize' : 'Toggle Radio Power'}
            className={`${classes.knobHitbox} ${showDebug ? `${classes.debugKnob} ${classes.debugPowerKnob}` : ''}`}
            style={{ ...knobStyle('power'), cursor: showDebug ? 'move' : 'pointer' }}
            onMouseDown={showDebug ? startDrag('power') : undefined}
            onClick={() => {
              if (lastDraggedRef.current) { lastDraggedRef.current = false; return; }
              powerToggle();
            }}
          />
          {showDebug && (
            <div
              aria-hidden="true"
              title="Resize"
              style={{
                position: 'absolute',
                zIndex: 4,
                top: layout.knobs.power.top + layout.knobs.power.height - 5,
                left: layout.knobs.power.left + layout.knobs.power.width - 5,
                width: 12,
                height: 12,
                background: '#1bda31',
                cursor: 'se-resize',
                borderRadius: 2,
              }}
              onMouseDown={startResize('power')}
            />
          )}
          {layout.knobs.set && (
            <>
              <button
                type="button"
                aria-label="Set channel"
                title={showDebug ? 'Drag to move · corner to resize' : 'Set Channel'}
                className={`${classes.knobHitbox} ${showDebug ? classes.debugKnob : ''}`}
                style={{
                  top: layout.knobs.set.top,
                  left: layout.knobs.set.left,
                  width: layout.knobs.set.width,
                  height: layout.knobs.set.height,
                  borderRadius: 8,
                  cursor: showDebug ? 'move' : 'pointer',
                }}
                onMouseDown={showDebug ? startDrag('set') : undefined}
                onClick={() => {
                  if (lastDraggedRef.current) { lastDraggedRef.current = false; return; }
                  if (!power) return;
                  Nui.send('SetChannel', { frequency: freq });
                }}
              />
              {showDebug && (
                <div
                  aria-hidden="true"
                  title="Resize"
                  style={{
                    position: 'absolute',
                    zIndex: 4,
                    top: layout.knobs.set.top + layout.knobs.set.height - 5,
                    left: layout.knobs.set.left + layout.knobs.set.width - 5,
                    width: 12,
                    height: 12,
                    background: '#4e64ff',
                    cursor: 'se-resize',
                    borderRadius: 2,
                  }}
                  onMouseDown={startResize('set')}
                />
              )}
            </>
          )}
          <div
            className={classes.radioMain}
            style={{
              top: layout.main.top,
              left: layout.main.left,
              width: layout.main.width,
              height: layout.main.height,
              cursor: showDebug ? 'move' : undefined,
              ...(radioType === 2 ? {
                background: '#0a0500',
                border: '1px solid #ff6a00',
                boxShadow: '0 0 8px #ff6a00, inset 0 0 6px rgba(255, 106, 0, 0.08)',
                borderRadius: 2,
              } : {}),
            }}
            onMouseDown={showDebug ? startDrag('main') : undefined}
          >
            {showDebug && (
              <div
                aria-hidden="true"
                title="Resize panel"
                style={{
                  position: 'absolute',
                  right: -4,
                  bottom: -4,
                  width: 12,
                  height: 12,
                  background: '#8db0ff',
                  cursor: 'se-resize',
                  borderRadius: 2,
                  zIndex: 10,
                }}
                onMouseDown={startResize('main')}
              />
            )}
            {radioType === 2 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  padding: '4px 8px',
                  fontFamily: '"Courier New", Courier, monospace',
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: '#ff6a00',
                    textShadow: '0 0 6px #ff6a00',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontFamily: '"Courier New", Courier, monospace',
                    opacity: 0.85,
                    alignSelf: 'flex-start',
                  }}
                >
                  {`Vol ${volume}%`}
                </div>
                <input
                  id="frequency"
                  type="number"
                  min="0"
                  max="2000"
                  disabled={!power}
                  value={freq}
                  className={classes.frequencyInput}
                  style={{
                    fontSize: 30,
                    color: '#ff6a00',
                    textShadow: '0 0 8px #ff6a00, 0 0 16px rgba(255,106,0,0.5)',
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: '0.08em',
                  }}
                  onChange={onChange}
                  onMouseDown={e => e.stopPropagation()}
                  placeholder="00"
                />
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 9,
                    color: '#ff6a00',
                    textShadow: '0 0 6px #ff6a00',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    lineHeight: 1.3,
                    fontFamily: '"Courier New", Courier, monospace',
                    opacity: 0.85,
                  }}
                >
                  {channelLabel}
                </div>
              </div>
            ) : (
              <>
                <div className={classes.topRow} style={{ justifyContent: 'center' }}>
                  <div className={classes.statusText}>{`Vol ${volume}%`}</div>
                </div>

                <div className={classes.center}>
                  <div className={classes.frequencyBox}>
                    <input
                      id="frequency"
                      type="number"
                      min="0"
                      max="2000"
                      disabled={!power}
                      value={freq}
                      className={classes.frequencyInput}
                      onChange={onChange}
                      onMouseDown={e => e.stopPropagation()}
                      placeholder="00"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!power}
                    title="Set Channel"
                    className={`${classes.actionButton} ${classes.connectButton}`}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={setChannel}
                  >
                    Set Channel
                  </button>

                  <div className={classes.channelText}>{channelLabel}</div>
                </div>
              </>
            )}
          </div>

          {isDev && showDebug && (
            <div className={classes.debugPanel}>
              <div className={classes.debugTitle}>Layout Debug</div>

              {debugGroups.map(group => (
                <div key={group.section} className={classes.debugSection}>
                  <div className={classes.debugSectionTitle}>{group.label}</div>

                  {['top', 'left', 'width', 'height'].map(field => {
                    const value =
                      group.section === 'main'
                        ? layout.main[field]
                        : layout.knobs[group.section][field];
                    return (
                      <div
                        key={`${group.section}-${field}`}
                        className={classes.debugRow}
                      >
                        <div className={classes.debugLabel}>{field}</div>
                        <input
                          type="range"
                          min={field === 'width' || field === 'height' ? 8 : 0}
                          max={
                            field === 'width' || field === 'height' ? 320 : 600
                          }
                          value={value}
                          onChange={e =>
                            updateLayout(group.section, field, e.target.value)
                          }
                          className={classes.debugInput}
                        />
                        <div className={classes.debugValue}>{value}</div>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className={classes.debugActions}>
                <button
                  type="button"
                  className={classes.debugButton}
                  style={{ background: '#1f2b4a', borderColor: '#4e64ff', color: '#8db0ff' }}
                  onClick={copyLayout}
                >
                  Copy Layout
                </button>
                <button
                  type="button"
                  className={classes.debugButton}
                  onClick={toggleDevRadioType}
                >
                  {radioType === 1 ? 'Type 1 → 2' : 'Type 2 → 1'}
                </button>
              </div>
              <div className={classes.debugActions} style={{ marginTop: 4 }}>
                <button
                  type="button"
                  className={classes.debugButton}
                  onClick={resetLayout}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className={classes.debugButton}
                  onClick={() => setShowDebug(false)}
                >
                  Hide
                </button>
              </div>
            </div>
          )}

          {isDev && !showDebug && (
            <button
              type="button"
              className={classes.debugPanel}
              style={{ width: 92, left: -108, padding: 8 }}
              onClick={() => setShowDebug(true)}
            >
              Show Debug
            </button>
          )}
        </div>
      </div>
    </Slide>
  );
};
