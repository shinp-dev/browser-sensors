# Browser Sensor Lab

ブラウザや端末がWebへ公開しているセンサー / ハードウェアAPIを診断する静的Webアプリです。

「対応APIだけを試すデモ」ではなく、**この端末 × このブラウザで何が見える／見えないか**を確認することを目的にしています。APIが存在しない場合も `ブラウザ非対応` として表示し、それ自体を診断結果として扱います。

## 主な診断対象

### 本体センサー / 端末情報

- Geolocation
- DeviceOrientationEvent / DeviceMotionEvent
- Generic Sensor API
  - Accelerometer
  - LinearAccelerationSensor
  - GravitySensor
  - Gyroscope
  - Magnetometer
  - AbsoluteOrientationSensor
  - RelativeOrientationSensor
  - AmbientLightSensor
- Screen Orientation
- Device Posture（折りたたみ端末）
- Pointer / Touch / maxTouchPoints
- Camera / Microphone
- MediaDevices.enumerateDevices()
- InputDeviceInfo.getCapabilities()
- Battery Status
- Network Information
- Hardware / Screen information
- Vibration
- Screen Wake Lock
- Speech Recognition
- Screen Capture

### 外部デバイスAPI

- Web Bluetooth
- WebUSB
- Web Serial
- Web NFC (NDEF)
- WebHID
- Gamepad API
- Web MIDI

## 表示の考え方

- **ブラウザ非対応**: APIの入口そのものが公開されていない
- **API対応**: APIの入口は存在する
- **取得中 / 接続中**: 実データ取得または接続に成功
- **取得エラー**: APIは存在するが、権限・HTTPS・Permissions Policy・OS制限・対象ハードウェア不足等で利用できない

APIの存在と、実際にデータを取得できることは別物として扱います。

## ローカル実行

一部APIはHTTPSまたはlocalhostでのみ利用できます。

```bash
git clone https://github.com/shinp-dev/browser-sensors.git
cd browser-sensors
python3 -m http.server 8000
```

`http://localhost:8000/` をブラウザで開いてください。

## プライバシー

カメラ映像・位置情報・センサー値を、このサイト独自のバックエンドへ保存・送信する処理はありません。

ただし以下には注意してください。

- Speech Recognition はブラウザ実装によって音声が外部の音声認識サービスへ送信される場合があります。
- ブラウザ / OS / Web API自身の実装による通信までは、このアプリから制御できません。

## ライセンス

MIT License
