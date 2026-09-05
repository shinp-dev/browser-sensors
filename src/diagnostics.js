const diagNumber = (value, digits = 2) => value == null ? '不明' : Number(value).toFixed(digits);

function vectorSensor(id, title, description, ctorName, unit) {
  return {
    id, title, description, experimental: true,
    supported: () => ctorName in window,
    state: {},
    async start(update, setState) {
      const sensor = new window[ctorName]({ frequency: 10 });
      this.state.sensor = sensor;
      this.state.verified = false;
      sensor.addEventListener('reading', () => {
        update(`X: ${diagNumber(sensor.x)} ${unit}\nY: ${diagNumber(sensor.y)} ${unit}\nZ: ${diagNumber(sensor.z)} ${unit}\nTimestamp: ${diagNumber(sensor.timestamp, 0)} ms`);
        if (!this.state.verified) {
          this.state.verified = true;
          setState('verified');
        }
      });
      sensor.addEventListener('error', (event) => setState('error', event.error?.message || 'センサー読み取りエラー'));
      sensor.start();
      setState('waiting', '開始済み (10 Hz)\n実データ待機中...');
    },
    async stop(update) {
      this.state.sensor?.stop();
      this.state.sensor = null;
      this.state.verified = false;
      update('停止しました');
    }
  };
}

function orientationSensor(id, title, description, ctorName) {
  return {
    id, title, description, experimental: true,
    supported: () => ctorName in window,
    state: {},
    async start(update, setState) {
      const sensor = new window[ctorName]({ frequency: 10 });
      this.state.sensor = sensor;
      this.state.verified = false;
      sensor.addEventListener('reading', () => {
        const q = sensor.quaternion;
        update(q ? `Quaternion\nX: ${diagNumber(q[0], 4)}\nY: ${diagNumber(q[1], 4)}\nZ: ${diagNumber(q[2], 4)}\nW: ${diagNumber(q[3], 4)}` : '実データ待機中...');
        if (q && !this.state.verified) {
          this.state.verified = true;
          setState('verified');
        }
      });
      sensor.addEventListener('error', (event) => setState('error', event.error?.message || '姿勢センサー読み取りエラー'));
      sensor.start();
      setState('waiting', '開始済み (10 Hz)\n実データ待機中...');
    },
    async stop(update) {
      this.state.sensor?.stop();
      this.state.sensor = null;
      this.state.verified = false;
      update('停止しました');
    }
  };
}

function describeTrack(track) {
  const settings = track.getSettings?.() || {};
  const caps = track.getCapabilities?.() || {};
  const lines = [
    `label: ${track.label || '(名称なし)'}`,
    `readyState: ${track.readyState}`,
    `muted: ${track.muted ? 'はい' : 'いいえ'}`
  ];

  const settingKeys = ['deviceId', 'groupId', 'width', 'height', 'frameRate', 'facingMode', 'sampleRate', 'sampleSize', 'channelCount', 'echoCancellation', 'noiseSuppression', 'autoGainControl'];
  const settingLines = settingKeys
    .filter((key) => settings[key] !== undefined)
    .map((key) => `${key}: ${settings[key]}`);
  if (settingLines.length) lines.push(`[Settings]\n${settingLines.join('\n')}`);

  const capabilityKeys = Object.keys(caps);
  if (capabilityKeys.length) {
    lines.push(`[Capabilities keys]\n${capabilityKeys.join(', ')}`);
    ['width', 'height', 'frameRate', 'zoom', 'torch', 'focusMode', 'exposureMode', 'whiteBalanceMode', 'sampleRate', 'channelCount']
      .filter((key) => caps[key] !== undefined)
      .forEach((key) => lines.push(`${key}: ${JSON.stringify(caps[key])}`));
  } else {
    lines.push('getCapabilities(): 利用不可または公開情報なし');
  }

  return lines.join('\n');
}

const diagnosticSensors = [
  vectorSensor('generic-accelerometer', '加速度 (Accelerometer)', 'Generic Sensor APIで重力を含む加速度を取得します。', 'Accelerometer', 'm/s²'),
  vectorSensor('linear-acceleration', '線形加速度 (LinearAccelerationSensor)', '重力成分を除いた加速度を取得します。', 'LinearAccelerationSensor', 'm/s²'),
  vectorSensor('gravity-sensor', '重力 (GravitySensor)', '重力ベクトルを取得します。', 'GravitySensor', 'm/s²'),
  vectorSensor('generic-gyroscope', 'ジャイロ (Gyroscope)', '各軸の角速度を取得します。', 'Gyroscope', 'rad/s'),
  vectorSensor('magnetometer', '磁力計 (Magnetometer)', '端末の磁力センサーが公開されている場合に磁場を取得します。', 'Magnetometer', 'µT'),
  orientationSensor('absolute-orientation', '絶対姿勢 (AbsoluteOrientationSensor)', '地球基準の姿勢をQuaternionで取得します。', 'AbsoluteOrientationSensor'),
  orientationSensor('relative-orientation', '相対姿勢 (RelativeOrientationSensor)', '端末基準の相対姿勢をQuaternionで取得します。', 'RelativeOrientationSensor'),
  {
    id: 'ambient-light', title: '環境光 (AmbientLightSensor)', description: '周囲の明るさをluxで取得します。', experimental: true,
    supported: () => 'AmbientLightSensor' in window, state: {},
    async start(update, setState) {
      const sensor = new AmbientLightSensor({ frequency: 2 });
      this.state.sensor = sensor;
      this.state.verified = false;
      sensor.addEventListener('reading', () => {
        update(`照度: ${diagNumber(sensor.illuminance)} lux`);
        if (!this.state.verified) {
          this.state.verified = true;
          setState('verified');
        }
      });
      sensor.addEventListener('error', (event) => setState('error', event.error?.message || '照度センサー読み取りエラー'));
      sensor.start();
      setState('waiting', '開始済み\n実データ待機中...');
    },
    async stop(update) { this.state.sensor?.stop(); this.state.sensor = null; this.state.verified = false; update('停止しました'); }
  },
  {
    id: 'screen-orientation', title: '画面方向 (Screen Orientation)', description: 'portrait / landscape と回転角を実際に読み取り、回転にも追従します。',
    supported: () => !!screen.orientation, state: {},
    async start(update, setState) {
      const orientation = screen.orientation;
      this.state.handler = () => {
        update(`向き: ${orientation.type}\n角度: ${orientation.angle}°\n\n端末を回転すると値が更新されます。`);
        setState('verified');
      };
      orientation.addEventListener('change', this.state.handler);
      this.state.handler();
    },
    async stop(update) { if (this.state.handler) screen.orientation.removeEventListener('change', this.state.handler); this.state.handler = null; update('停止しました'); }
  },
  {
    id: 'device-posture', title: '折りたたみ状態 (Device Posture)', description: '折りたたみ端末の continuous / folded 状態を実際に読み取ります。', experimental: true,
    supported: () => 'devicePosture' in navigator, state: {},
    async start(update, setState) {
      const posture = navigator.devicePosture;
      this.state.handler = () => {
        update(`端末姿勢: ${posture.type}`);
        setState('verified');
      };
      posture.addEventListener('change', this.state.handler);
      this.state.handler();
    },
    async stop(update) { if (this.state.handler) navigator.devicePosture.removeEventListener('change', this.state.handler); this.state.handler = null; update('停止しました'); }
  },
  {
    id: 'touch-capability', title: 'タッチ能力', description: '最大同時タッチ数とTouch/Pointer APIの公開状況を取得します。', oneShot: true,
    supported: () => 'maxTouchPoints' in navigator,
    async start(update, setState) {
      update(`最大同時タッチ数: ${navigator.maxTouchPoints}\nTouchEvent: ${'TouchEvent' in window ? '対応' : '非対応'}\nPointerEvent: ${'PointerEvent' in window ? '対応' : '非対応'}\n\n実際の座標・筆圧は「ポインター＆タッチ」で試せます。`);
      setState('verified');
    },
    async stop(update) { update('停止しました'); }
  },
  {
    id: 'media-devices', title: 'カメラ / マイク実機診断', description: 'カメラとマイクを実際に一時起動し、Settings / Capabilitiesとデバイス一覧を確認してすぐ停止します。', oneShot: true,
    supported: () => !!(navigator.mediaDevices?.getUserMedia && navigator.mediaDevices?.enumerateDevices),
    async start(update, setState) {
      const sections = [];
      let successCount = 0;

      const probe = async (kind) => {
        let stream = null;
        const label = kind === 'video' ? 'カメラ' : 'マイク';
        try {
          update(`${label}の権限と実機動作を確認中...`);
          stream = await navigator.mediaDevices.getUserMedia(kind === 'video'
            ? { video: { facingMode: { ideal: 'environment' } }, audio: false }
            : { video: false, audio: true });
          const track = kind === 'video' ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
          if (!track) throw new DOMException(`${label}トラックを取得できませんでした`, 'NotFoundError');
          successCount += 1;
          sections.push(`【${label}: 実動作成功】\n${describeTrack(track)}`);
        } catch (error) {
          sections.push(`【${label}: 取得失敗】\n${error.name || 'Error'}: ${error.message || String(error)}`);
        } finally {
          stream?.getTracks().forEach((track) => track.stop());
        }
      };

      await probe('video');
      await probe('audio');

      let devices = [];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
        const counts = devices.reduce((acc, device) => {
          acc[device.kind] = (acc[device.kind] || 0) + 1;
          return acc;
        }, {});
        const rows = devices.map((device, index) => {
          const capabilityKeys = typeof device.getCapabilities === 'function'
            ? Object.keys(device.getCapabilities())
            : [];
          return `${index + 1}. ${device.kind}\n   label: ${device.label || '(名称非公開)'}\n   capabilities: ${capabilityKeys.length ? capabilityKeys.join(', ') : '公開なし'}`;
        });
        sections.push(`【デバイス列挙】\nvideoinput: ${counts.videoinput || 0}\naudioinput: ${counts.audioinput || 0}\naudiooutput: ${counts.audiooutput || 0}\n\n${rows.join('\n\n') || 'デバイスなし'}`);
      } catch (error) {
        sections.push(`【デバイス列挙失敗】\n${error.name || 'Error'}: ${error.message || String(error)}`);
      }

      update(sections.join('\n\n'));
      if (successCount === 2) {
        setState('verified');
      } else if (successCount === 1) {
        setState('partial');
      } else {
        setState('blocked');
      }
    },
    async stop(update) { update('停止しました'); }
  }
];

function renderDiagnosticCard(sensor, container) {
  const supported = sensor.supported();
  const card = document.createElement('section');
  card.className = `card diagnostic-card ${supported ? '' : 'unsupported'}`;
  card.id = `card-${sensor.id}`;

  const header = document.createElement('div');
  header.className = 'card-header';
  const heading = document.createElement('div');
  const title = document.createElement('div'); title.className = 'card-title'; title.textContent = sensor.title;
  const desc = document.createElement('div'); desc.className = 'card-desc'; desc.textContent = sensor.description;
  heading.append(title, desc);
  if (sensor.experimental) { const tag = document.createElement('span'); tag.className = 'experimental-flag'; tag.textContent = '実験的 / 限定対応'; heading.appendChild(tag); }
  const badge = document.createElement('div'); badge.className = 'status-badge'; badge.textContent = supported ? 'API対応・未確認' : 'ブラウザ非対応';
  header.append(heading, badge);

  const content = document.createElement('div'); content.className = 'card-content';
  const pre = document.createElement('pre'); pre.textContent = supported ? 'APIを検出しました。開始すると実データ取得まで試します。' : 'このブラウザではAPIの入口が公開されていません。\nこれは正常な診断結果です。';
  content.appendChild(pre);
  const button = document.createElement('button'); button.className = 'btn'; button.textContent = supported ? '動作確認' : '非対応'; button.disabled = !supported;
  let running = false;
  let busy = false;
  let transitioned = false;
  const update = (text) => { pre.textContent = text; };
  const setState = (state, message) => {
    transitioned = true;
    if (message) update(message);
    if (state === 'waiting') {
      running = true;
      card.classList.add('active');
      badge.textContent = 'データ待ち';
      button.textContent = '停止';
    } else if (state === 'verified') {
      badge.textContent = '動作確認済';
      if (sensor.oneShot) {
        running = false;
        card.classList.remove('active');
        button.textContent = '再実行';
      } else {
        running = true;
        card.classList.add('active');
        button.textContent = '停止';
      }
    } else if (state === 'partial') {
      running = false;
      card.classList.remove('active');
      badge.textContent = '一部確認';
      button.textContent = '再実行';
    } else if (state === 'blocked') {
      running = false;
      card.classList.remove('active');
      badge.textContent = '取得不可';
      button.textContent = '再試行';
    } else if (state === 'error') {
      running = false;
      card.classList.remove('active');
      badge.textContent = '取得エラー';
      button.textContent = '再試行';
    }
  };

  button.addEventListener('click', async () => {
    if (!supported || busy) return;
    busy = true;
    button.disabled = true;
    transitioned = false;
    try {
      if (running && !sensor.oneShot) {
        await sensor.stop(update);
        running = false;
        card.classList.remove('active');
        badge.textContent = 'API対応・未確認';
        button.textContent = '動作確認';
      } else {
        badge.textContent = '確認中';
        await sensor.start(update, setState);
        if (!transitioned) {
          if (sensor.oneShot) {
            badge.textContent = '動作確認済';
            button.textContent = '再実行';
          } else {
            running = true;
            card.classList.add('active');
            badge.textContent = '動作中';
            button.textContent = '停止';
          }
        }
      }
    } catch (error) {
      running = false;
      card.classList.remove('active');
      badge.textContent = '取得エラー';
      button.textContent = '再試行';
      update(`${error.name || 'Error'}: ${error.message || String(error)}\n\nAPIは存在しますが、権限・HTTPS・端末ハードウェア・ブラウザポリシー等により取得できませんでした。`);
    } finally {
      busy = false;
      button.disabled = false;
    }
  });

  card.append(header, content, button);
  container.appendChild(card);
}

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sensor-container');
  if (!container) return;
  diagnosticSensors.forEach((sensor) => renderDiagnosticCard(sensor, container));

  const cards = Array.from(container.querySelectorAll('.card'));
  const unsupported = cards.filter((card) => card.classList.contains('unsupported')).length;
  const summary = document.getElementById('capability-summary');
  if (summary) summary.innerHTML = `<strong>${cards.length - unsupported} / ${cards.length}</strong> 項目でAPI入口を検出 <span>非対応: ${unsupported}</span><small>「API対応」は入口の検出、「動作確認済」は実データ取得成功です。非対応や取得不可もこの端末・ブラウザの診断結果です。</small>`;
});
