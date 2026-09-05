window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sensor-container');
  if (!container) return;
  const supported = 'hid' in navigator;
  const card = document.createElement('section');
  card.className = `card diagnostic-card ${supported ? '' : 'unsupported'}`;
  card.id = 'card-hid';
  card.innerHTML = `<div class="card-header"><div><div class="card-title">WebHID</div><div class="card-desc">HIDデバイス選択・接続・入力レポート受信の可否を確認します。</div><span class="experimental-flag">実験的 / 限定対応</span></div><div class="status-badge">${supported ? 'API対応' : 'ブラウザ非対応'}</div></div><div class="card-content"><pre>${supported ? 'APIを検出しました。開始するとデバイス選択を試します。' : 'このブラウザではWebHID APIが公開されていません。\nこれは正常な診断結果です。'}</pre></div>`;
  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = supported ? '開始 / 接続' : '非対応';
  button.disabled = !supported;
  const pre = card.querySelector('pre');
  const badge = card.querySelector('.status-badge');
  let device = null;

  button.addEventListener('click', async () => {
    if (!supported) return;
    button.disabled = true;
    try {
      if (device) {
        if (device.opened) await device.close();
        device = null;
        badge.textContent = 'API対応';
        button.textContent = '開始 / 接続';
        card.classList.remove('active');
        pre.textContent = '切断しました。';
      } else {
        badge.textContent = '開始中';
        const devices = await navigator.hid.requestDevice({ filters: [] });
        if (!devices.length) throw new DOMException('デバイスが選択されませんでした', 'NotFoundError');
        device = devices[0];
        if (!device.opened) await device.open();
        badge.textContent = '接続中';
        button.textContent = '切断';
        card.classList.add('active');
        pre.textContent = `製品名: ${device.productName || '不明'}\nVendor ID: 0x${device.vendorId.toString(16).padStart(4, '0')}\nProduct ID: 0x${device.productId.toString(16).padStart(4, '0')}\nCollections: ${device.collections?.length || 0}\n\n入力レポート待機中...`;
        device.addEventListener('inputreport', (event) => {
          const bytes = Array.from(new Uint8Array(event.data.buffer)).slice(0, 64);
          pre.textContent = `Report ID: ${event.reportId}\nData (${event.data.byteLength} bytes):\n${bytes.map((v) => v.toString(16).padStart(2, '0')).join(' ')}`;
        });
      }
    } catch (error) {
      badge.textContent = '取得エラー';
      button.textContent = '再試行';
      card.classList.remove('active');
      device = null;
      pre.textContent = `${error.name}: ${error.message}`;
    } finally {
      button.disabled = false;
    }
  });

  card.appendChild(button);
  container.appendChild(card);
});
