const plainLanguageCards = {
  geolocation: {
    title: '現在地・位置情報',
    description: '現在地の緯度・経度と、どのくらい正確に測れているかを確認します。'
  },
  orientation: {
    title: '端末の向き・傾き',
    description: 'スマホを傾けたり回したりすると、向きの変化を角度で表示します。'
  },
  motion: {
    title: '端末の動き',
    description: 'スマホを振ったり動かしたりしたときの加速度と回転の速さを表示します。'
  },
  camera: {
    title: 'カメラ',
    description: 'カメラを実際に起動して、映像と解像度・フレームレートを確認します。'
  },
  microphone: {
    title: 'マイク',
    description: 'マイクを実際に起動して、拾っている音の大きさを確認します。'
  },
  battery: {
    title: 'バッテリー',
    description: 'バッテリー残量や、現在充電中かどうかを確認します。'
  },
  network: {
    title: '通信状態',
    description: 'ブラウザが把握している通信速度の目安や応答時間を表示します。Wi-Fiや5Gそのものの判別ではありません。'
  },
  pointer: {
    title: 'タッチ・マウス・ペン',
    description: '画面を触った位置やマウス・ペンの動き、対応していれば筆圧を表示します。'
  },
  vibration: {
    title: 'バイブレーション',
    description: '端末を実際に振動させて、Webページからバイブ機能を使えるか試します。'
  },
  hardware: {
    title: '端末の基本情報',
    description: 'ブラウザから見えるCPUコア数やメモリ量などを確認します。実際の搭載量と一致しない場合があります。'
  },
  screen: {
    title: '画面サイズ・表示領域',
    description: '画面サイズ、ブラウザの表示領域、ピクセル比などを確認します。'
  },
  wakelock: {
    title: '画面のスリープ防止',
    description: 'このページを開いている間、画面が自動で消えないようにできるか試します。'
  },
  speech: {
    title: '音声を文字に変換',
    description: '話した言葉を文字に変換できるか試します。ブラウザによって外部の音声認識サービスを使う場合があります。'
  },
  screenshare: {
    title: '画面共有',
    description: '画面やウィンドウを選んで、ブラウザから画面共有できるか試します。'
  },
  'generic-accelerometer': {
    title: '加速度（重力を含む）',
    description: 'スマホを動かしたときの加速度をX・Y・Zで表示します。端末にかかる重力も含んだ値です。'
  },
  'linear-acceleration': {
    title: '加速度（重力を除く）',
    description: 'スマホを実際に動かした分だけの加速度を表示します。重力の影響を除いた値です。'
  },
  'gravity-sensor': {
    title: '重力の向き',
    description: '端末にかかっている重力の向きをX・Y・Zで表示します。スマホを傾けると値が変わります。'
  },
  'generic-gyroscope': {
    title: '回転の速さ（ジャイロ）',
    description: 'スマホを回したときの回転の速さをX・Y・Zで表示します。'
  },
  magnetometer: {
    title: '磁気センサー',
    description: '周囲の磁場の強さを表示します。方位磁石のような機能に使われるセンサーです。'
  },
  'absolute-orientation': {
    title: '地球基準の端末の向き',
    description: 'スマホが地球に対してどちらを向いているかを姿勢データとして表示します。'
  },
  'relative-orientation': {
    title: '開始時からの向きの変化',
    description: '開始した時点から、端末の向きがどれだけ変わったかを姿勢データとして表示します。'
  },
  'ambient-light': {
    title: '周囲の明るさ',
    description: '周囲がどのくらい明るいかを照度（lux）で表示します。'
  },
  'screen-orientation': {
    title: '画面の表示方向',
    description: 'ブラウザ画面が縦表示か横表示かを確認します。自動回転をONにして画面が回転すると値も変わります。'
  },
  'device-posture': {
    title: '折りたたみ端末の状態',
    description: '折りたたみ端末で、画面が開いているか折り曲げられているかを確認します。'
  },
  'touch-capability': {
    title: 'タッチ操作の対応状況',
    description: 'この端末が同時に何本の指まで扱えるかなど、タッチ操作の対応状況を確認します。'
  },
  'media-devices': {
    title: 'カメラ・マイクの詳しい診断',
    description: 'カメラとマイクを一時的に起動し、実際に使えるか、どんな機能がブラウザに公開されているかをまとめて確認します。'
  },
  bluetooth: {
    title: 'Bluetooth機器',
    description: '近くのBluetooth Low Energy機器を選べるか確認します。実際に何ができるかは機器ごとに異なります。'
  },
  usb: {
    title: 'USB機器',
    description: 'ブラウザからUSB機器を選び、製品名やIDなどを確認できるか試します。'
  },
  serial: {
    title: 'シリアル機器',
    description: 'ArduinoなどのUSBシリアル機器に接続し、受信データを表示します。'
  },
  nfc: {
    title: 'NFCタグ',
    description: 'NDEF形式のNFCタグをスマホにかざして読み取れるか試します。SuicaなどのICカードは対象外です。'
  },
  gamepad: {
    title: 'ゲームコントローラー',
    description: 'ゲームコントローラーを接続して、ボタンやスティックの入力を表示します。'
  },
  midi: {
    title: 'MIDI機器',
    description: '電子ピアノなどのMIDI機器を接続して、鍵盤から届く入力を表示します。'
  },
  hid: {
    title: 'HID機器',
    description: '対応するHID機器を選び、ブラウザから接続して入力データを受け取れるか試します。'
  }
};

function applyPlainLanguage() {
  const isExternalPage = document.querySelector('script[src*="external.js"]') !== null;
  const headerText = document.querySelector('header > p');
  if (headerText) {
    headerText.textContent = isExternalPage
      ? 'このブラウザから、BluetoothやUSBなどの外部機器をどこまで使えるか確認します。'
      : 'このスマホ・PCとブラウザで、どんな端末機能が使えるかを実際に試して確認します。';
  }

  Object.entries(plainLanguageCards).forEach(([id, copy]) => {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;
    const title = card.querySelector('.card-title');
    const description = card.querySelector('.card-desc');
    if (title) title.textContent = copy.title;
    if (description) description.textContent = copy.description;
  });

  const categoryDescriptions = {
    '本体センサー': 'スマホを動かす、傾ける、明るい場所へ移動するなど、端末そのもののセンサーを実際に試します。',
    '端末能力': 'カメラ、マイク、画面、タッチ、バッテリーなど、ブラウザから使える端末機能を確認します。'
  };
  document.querySelectorAll('.category-heading').forEach((section) => {
    const title = section.querySelector('h2')?.textContent;
    const description = section.querySelector('p');
    if (description && categoryDescriptions[title]) description.textContent = categoryDescriptions[title];
  });

  const summary = document.getElementById('capability-summary');
  if (summary && !isExternalPage) {
    const cards = Array.from(document.querySelectorAll('#sensor-container .card'));
    const unsupported = cards.filter((card) => card.classList.contains('unsupported')).length;
    summary.innerHTML = `<strong>${cards.length - unsupported} / ${cards.length}</strong> 種類の機能をブラウザが認識 <span>このブラウザでは使えない機能: ${unsupported}</span><small>「認識した」だけでは実際に動くとは限りません。各項目の「動作確認」を押して、実データが取れるところまで試せます。</small>`;
  }
}

window.addEventListener('DOMContentLoaded', applyPlainLanguage);
