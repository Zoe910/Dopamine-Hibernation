const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { WebSocketServer, WebSocket } = require('ws');
const ARDUINO_PORT = '/dev/cu.usbmodem1301'; 
const BAUD_RATE = 9600;
const WS_PORT = 8080;

// ==========================================
//  WebSocket 
// ==========================================
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`🟢 WebSocket 服务已启动，监听端口: ${WS_PORT}`);

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`✨ 新客户端已连接 (当前连接数: ${wss.clients.size})`);

  ws.on('close', () => {
    console.log(`🔴 客户端已断开 (剩余连接数: ${wss.clients.size})`);
  });

  ws.on('error', (err) => {
    console.error('WebSocket 客户端错误:', err);
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// ==========================================
// 3. Connect Arduino 
// ==========================================
const port = new SerialPort({
  path: ARDUINO_PORT,
  baudRate: BAUD_RATE,
  autoOpen: false 
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

port.open((err) => {
  if (err) {
    return console.error(`❌ 无法打开串口 ${ARDUINO_PORT}:`, err.message);
  }
  console.log(`🔌 成功连接到 Arduino 串口: ${ARDUINO_PORT}`);
});

parser.on('data', (line) => {
  let cleanData = line.trim();
  if (cleanData.length > 0) {
    console.log(`📡 发送数据 -> ${cleanData}`);
    
    broadcast(cleanData);
  }
});

port.on('error', (err) => {
  console.error('串口发生错误:', err.message);
});