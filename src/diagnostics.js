const diagNumber = (value, digits = 2) => value == null ? '不明' : Number(value).toFixed(digits);

function vectorSensor(id, title, description, ctorName, unit) {
  return {
    id, title, description, experimental: true,
    supported: () => ctorName in window,
    state: {},
    async start(update, setState) {
      const sensor = new window[ctorName]({ frequency: 10 });
      this.state.sensor = sensor;
      sensor.addEventListener('reading', () => {
        update(`X: ${diagNumber(sensor.x)} ${unit}\nY: ${diagNumber(sensor.y)} ${unit}\nZ: ${diagNumber(sensor.z)} ${unit}\nTimestamp: ${diagNumber(sensor.timestamp, 0)} ms`);
      });
      sensor.addEventListener('error', (event) => setState('error', event.error?.message || 'センサー読み取りエラー'));
      sensor.start();
      update('開始済み (10 Hz)\nデータ待機中...');
    },
    async stop(update) {
      this.state.sensor?.stop();
      this.state.sensor = null;
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
      sensor.addEventListener('reading', () => {
        const q = sensor.quaternion;
        update(q ? `Quaternion\nX: ${diagNumber(q[0], 4)}\nY: ${diagNumber(q[1], 4)}\nZ: ${diagNumber(q[2], 4)}\nW: ${diagNumber(q[3], 4)}` : 'データ待機中...');
      });
      sensor.addEventListener('error', (event) => setState('error', event.error?.message || '姿勢センサー読み取りエラー'));
      sensor.start();
      update('開始済み (10 Hz)\nデータ待機中...');
    },
    async stop(update) {
      this.state.sensor?.stop();
      this.state.sensor = null;
      update('停止しました');
    }
  };
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
      sensor.addEventListener('reading', () => update(`照度: ${diagNumber(sensor.illuminance)} lux`));
      sensor.addEventListener('error', (event) => setState('error', event.error?.message || '照度センサー読み取りエラー'));
      sensor.start();
      update('開始済み\nデータ待機中...');
    },
    async stop(update) { this.state.sensor?.stop(); this.state.sensor = null; update('停止しました'); }
  },
  {
    id: 'screen-orientation', title: '画面方向 (Screen Orientation)', description: 'portrait / landscape と回転角を取得します。',
    supported: () => !!screen.orientation, state: {},
    async start(update) {
      const orientation = screen.orientation;
      this.state.handler = () => update(`向き: ${orientation.type}\n角度: ${orientation.angle}°`);
      orientation.addEventListener('change', this.state.handler);
      this.state.handler();
    },
    async stop(update) { if (this.state.handler) screen.orientation.removeEventListener('change', this.state.handler); this.state.handler = null; update('停止しました'); }
  },
  {
    id: 'device-posture', title: '折りたたみ状態 (Device Posture)', description: '折りたたみ端末の continuous / folded 状態を取得します。', experimental: true,
    supported: () => 'devicePosture' in navigator, state: {},
    async start(update) {
      const posture = navigator.devicePosture;
      this.state.handler = () => update(`端末姿勢: ${posture.type}`);
      posture.addEventListener('change', this.state.handler);
      this.state.handler();
    },
    async stop(update) { if (this.state.handler) navigator.devicePosture.removeEventListener('change', this.state.handler); this.state.handler = null; update('停止しました'); }
  },
  {
    id: 'touch-capability', title: 'タッチ能力', description: '最大同時タッチ数とTouch/Pointer APIの公開状況を表示します。',
    supported: () => 'maxTouchPoints' in navigator,
    async start(update) { update(`最大同時タッチ数: ${navigator.maxTouchPoints}\nTouchEvent: ${'TouchEvent' in window ? '対応' : '非対応'}\nPointerEvent: ${'PointerEvent' in window ? '対応' : '非対応'}`); },
    async stop(update) { update('停止しました'); }
  },
  {
    id: 'media-devices', title: 'カメラ / マイク一覧・能力', description: 'enumerateDevices()とInputDeviceInfo.getCapabilities()の公開状況を確認します。',
    supported: () => !!navigator.mediaDevices?.enumerateDevices,
    async start(update) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const counts = devices.reduce((acc, d) => { acc[d.kind] = (acc[d.kind] || 0) + 1; return acc; }, {});
      const rows = devices.map((device, index) => {
        let capabilities = '非対応';
        if (typeof device.getCapabilities === 'function') {
          const caps = device.getCapabilities();
          const keys = Object.keys(caps);
          capabilities = keys.length ? keys.join(', ') : '利用可（権限付与前などは空）';
        }
        return `${index + 1}. ${device.kind}\n   label: ${device.label || '(権限付与前は非表示の場合あり)'}\n   getCapabilities: ${capabilities}`;
      });
      update(`videoinput: ${counts.videoinput || 0}\naudioinput: ${counts.audioinput || 0}\naudiooutput: ${counts.audiooutput || 0}\n\n${rows.join('\n\n') || 'デバイスなし'}`);
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
  const badge = document.createElement('div'); badge.className = 'status-badge'; badge.textContent = supported ? 'API対応' : 'ブラウザ非対応';
  header.append(heading, badge);

  const content = document.createElement('div'); content.className = 'card-content';
  const pre = document.createElement('pre'); pre.textContent = supported ? 'APIを検出しました。開始すると実データ取得を試します。' : 'このブラウザではAPIの入口が公開されていません。\nこれは正常な診断結果です。';
  content.appendChild(pre);
  const button = document.createElement('button'); button.className = 'btn'; button.textContent = supported ? '開始 / 取得' : '非対応'; button.disabled = !supported;
  let running = false; let busy = false;
  const update = (text) => { pre.textContent = text; };
  const setState = (state, message) => { if (message) update(message); if (state === 'error') { running = false; card.classList.remove('active'); badge.textContent = '取得エラー'; button.textContent = '再試行'; } };

  button.addEventListener('click', async () => {
    if (!supported || busy) return;
    busy = true; button.disabled = true;
    try {
      if (running) {
        await sensor.stop(update); running = false; card.classList.remove('active'); badge.textContent = 'API対応'; button.textContent = '開始 / 取得';
      } else {
        badge.textContent = '開始中'; await sensor.start(update, setState); running = true; card.classList.add('active'); badge.textContent = '取得中'; button.textContent = '停止';
      }
    } catch (error) {
      running = false; card.classList.remove('active'); badge.textContent = '取得エラー'; button.textContent = '再試行';
      update(`${error.name || 'Error'}: ${error.message || String(error)}\n\nAPIは存在しますが、権限・HTTPS・端末ハードウェア・ブラウザポリシー等により取得できませんでした。`);
    } finally { busy = false; button.disabled = false; }
  });

  card.append(header, content, button); container.appendChild(card);
}

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sensor-container');
  if (!container) return;
  diagnosticSensors.forEach((sensor) => renderDiagnosticCard(sensor, container));

  const cards = Array.from(container.querySelectorAll('.card'));
  const unsupported = cards.filter((card) => card.classList.contains('unsupported')).length;
  const summary = document.getElementById('capability-summary');
  if (summary) summary.innerHTML = `<strong>${cards.length - unsupported} / ${cards.length}</strong> 項目でAPI入口を検出 <span>非対応: ${unsupported}</span><small>「非対応」もこの端末・ブラウザの診断結果です。APIが存在しても権限・HTTPS・端末ハードウェア等で実データ取得に失敗する場合があります。</small>`;
});
