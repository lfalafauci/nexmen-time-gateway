// api/time.js

const ntpClient = require('ntp-client');

module.exports = (req, res) => {

  ntpClient.getNetworkTime('ntp1.inrim.it', 123, function(err, date) {
    if (err) {
      res.status(500).json({
        error: 'NTP_ERROR',
        details: err.toString()
      });
      return;
    }

    // Converte in ISO (UTC reale)
    const utc = date.toISOString();

    // Calcolo GMT+1
    const local = new Date(date.getTime() + (1 * 60 * 60 * 1000));

    const formatted =
      `${local.getDate().toString().padStart(2, '0')}/` +
      `${(local.getMonth() + 1).toString().padStart(2, '0')}/` +
      `${local.getFullYear()} – ` +
      `${local.getHours().toString().padStart(2, '0')}:` +
      `${local.getMinutes().toString().padStart(2, '0')}:` +
      `${local.getSeconds().toString().padStart(2, '0')} GMT+1`;

    res.status(200).json({
      source: "INRIM NTP (ntp1.inrim.it)",
      utc,
      local_time: formatted
    });
  });

};
