const QRCode = require("qrcode");
const fs = require("fs");

// Fungsi untuk membuat QR code dengan isi endpoint /wallet/{id}
async function generateQRCode(memberId) {
  const url = `http://localhost:3000/cek/${memberId}`;
  var opts = {
    errorCorrectionLevel: "H",
    type: "image/png",
    scale: 5,
    quality: 1,
    margin: 1,
    color: {
      dark: "#000000ff",
      light: "#ffffffff",
    },
  };

  try {
    // Membuat QR code
    const qrCode = await QRCode.toFile(
      `qrcodes/member_${memberId}.png`,
      url,
      opts
    );

    console.log(`QR Code untuk member dengan ID ${memberId} telah dibuat`);
  } catch (error) {
    console.error("Terjadi kesalahan dalam pembuatan QR code:", error);
  }
}

module.exports = generateQRCode;
