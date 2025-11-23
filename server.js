// server.js
import dgram from "dgram";
import http from "http";

// Server NTP INRIM
const NTP_SERVER = "ntp1.inrim.it";
const NTP_PORT = 123;

// Differenza tra epoca NTP (1900) e epoca Unix (1970)
const NTP_DELTA = 2208988800;

function getNTPTime() {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket("udp4");

    const msg = Buffer.alloc(48);
    msg[0] = 0x1B; // LI=0, Version=3, Mode=3 (client)

    client.send(msg, 0, msg.length, NTP_PORT, NTP_SERVER, (err) => {
      if (err) reject(err);
    });

    client.once("message", (msg) => {
      client.close();

      const seconds = msg.readUInt32BE(40);
      const unixTime = seconds - NTP_DELTA;

      resolve(new Date(unixTime * 1000));
    });

    client.once("error", (err) => {
      client.close();
      reject(err);
    });
  });
}

function formatGMT1(date) {
  const local = new Date(date.getTime() + 1 * 3600 * 1000);

  const pad = (n) => n.toString().padStart(2, "0");

  return (
    `${pad(local.getDate())}/` +
    `${pad(local.getMonth() + 1)}/` +
    `${local.getFullYear()} – ` +
    `${pad(local.getHours())}:` +
    `${pad(local.getMinutes())}:` +
    `${pad(local.getSeconds())} GMT+1`
  );
}

// HTTP SERVER
const server = http.createServer(async (req, res) => {
  if (req.url === "/time") {
    try {
      const dateUTC = await getNTPTime();
      const local = formatGMT1(dateUTC);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            source: "INRIM NTP (ntp1.inrim.it)",
            utc: dateUTC.toISOString(),
            local_time: local
          },
          null,
          2
        )
      );
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.toString() }));
    }
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Gateway Nexmen attivo sulla porta " + PORT);
});
