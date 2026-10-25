const readline = require("readline");

// 1. KHOI TAO CSDL VE MAY BAY BAN DAU
const flightTickets = [
  {
    pnr: "VJ101",
    passengerName: "Nguyen Van An",
    classTier: "ECONOMY", // Mien cuoc 20kg
    checkedBaggageKg: 18,
    excessFee: 0,
    status: "BOOKED"
  },
  {
    pnr: "VN205",
    passengerName: "Tran Thi Mai",
    classTier: "BUSINESS", // Mien cuoc 30kg
    checkedBaggageKg: 35,
    excessFee: 250000,
    status: "BOOKED"
  },
  {
    pnr: "QH330",
    passengerName: "Le Van Binh",
    classTier: "ECONOMY", // Mien cuoc 20kg
    checkedBaggageKg: 15,
    excessFee: 0,
    status: "BOOKED"
  }
];

let autoPnrCounter = 4;

// Cau hinh readline interface de tuong tac qua console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 2. CAC HAM NGHIỆP VU DOC LAP (BUSINESS LOGIC LAYER)

// Ham tim kiem ve theo ma PNR
const findTicketByPnr = (list, pnrInput) => {
  if (!pnrInput) return null;
  const targetPnr = pnrInput.trim().toUpperCase();
  for (let i = 0; i < list.length; i++) {
    if (list[i].pnr.toUpperCase() === targetPnr) {
      return list[i];
    }
  }
  return null;
};

// Ham tinh phi qua can han muc hanh ly
const calculateExcessBaggageFee = (classTier, baggageKg) => {
  const cleanTier = classTier ? classTier.trim().toUpperCase() : "ECONOMY";
  const freeAllowance = cleanTier === "BUSINESS" ? 30 : 20;

  if (baggageKg > freeAllowance) {
    const excessKg = baggageKg - freeAllowance;
    return excessKg * 50000; // 50.000 VND / kg vuot muc
  }

  return 0;
};

// Ham xuat the len may bay (Boarding Pass)
const displayBoardingPass = (ticket) => {
  const line = "-".repeat(60);
  console.log("\n" + line);
  console.log("                  THE LEN MAY BAY (BOARDING PASS)                 ");
  console.log(line);
  console.log(`MA PNR       : ${ticket.pnr}`);
  console.log(`HANH KHACH   : ${ticket.passengerName}`);
  console.log(`HANG VE      : ${ticket.classTier}`);
  console.log(`HANH LY KY   : ${ticket.checkedBaggageKg} kg`);
  console.log(`PHI QUA CAN  : ${ticket.excessFee.toLocaleString()} VND`);
  console.log(`TRANG THAI   : ${ticket.status}`);
  console.log(line);
};

// CREATE / ADD TICKET: Tiep nhan dat ve moi hoac tao ve tai quay
const createTicket = (list, passengerName, classTier, checkedBaggageKg) => {
  if (!passengerName || passengerName.trim() === "") {
    console.log("[ERROR]: Ten hanh khach khong duoc de rong.");
    return false;
  }

  const cleanTier = classTier ? classTier.trim().toUpperCase() : "ECONOMY";
  if (cleanTier !== "ECONOMY" && cleanTier !== "BUSINESS") {
    console.log("[ERROR]: Hang ve khong hop le (Chi chap nhan ECONOMY hoac BUSINESS).");
    return false;
  }

  const baggage = Number(checkedBaggageKg);
  if (isNaN(baggage) || baggage < 0) {
    console.log("[ERROR]: Can nang hanh ly khong hop le.");
    return false;
  }

  const generatedPnr = "VJ" + (100 + autoPnrCounter);
  autoPnrCounter++;

  const fee = calculateExcessBaggageFee(cleanTier, baggage);

  const newTicket = {
    pnr: generatedPnr,
    passengerName: passengerName.trim(),
    classTier: cleanTier,
    checkedBaggageKg: baggage,
    excessFee: fee,
    status: "BOOKED"
  };

  list.push(newTicket);
  console.log(`[SUCCESS]: Tao ve thanh cong cho "${newTicket.passengerName}" voi ma PNR: ${newTicket.pnr}`);
  return true;
};

// READ / LIST TICKETS: Hien thi danh sach ve dang bang
const listTickets = (list) => {
  const borderLine = "-".repeat(90);
  console.log("\n" + borderLine);
  console.log("                              DANH SACH VE CHUYEN BAY                             ");
  console.log(borderLine);
  console.log(
    "MA PNR".padEnd(10) +
    "TEN HANH KHACH".padEnd(24) +
    "HANG VE".padEnd(14) +
    "HANH LY".padEnd(14) +
    "PHI QUACAN".padEnd(16) +
    "TRANG THAI"
  );
  console.log(borderLine);

  if (list.length === 0) {
    console.log("                           KHONG CO DU LIEU VE TRONG HE THONG                           ");
  } else {
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const colPnr = t.pnr.padEnd(10);
      const colName = (t.passengerName.length > 21 ? t.passengerName.slice(0, 18) + "..." : t.passengerName).padEnd(24);
      const colTier = t.classTier.padEnd(14);
      const colBag = (t.checkedBaggageKg.toString() + " kg").padEnd(14);
      const colFee = (t.excessFee.toLocaleString() + " VND").padEnd(16);
      const colStatus = t.status;

      console.log(`${colPnr}${colName}${colTier}${colBag}${colFee}${colStatus}`);
    }
  }

  console.log(borderLine);
  console.log(`TONG SO VE: ${list.length.toString().padStart(8)} ve`);
  console.log(borderLine);
};

// CHECK-IN & BAGGAGE: Tiep nhan check-in, can han ly, tinh phu phi va xuat boarding pass
const checkInPassenger = (list, pnrInput, baggageKgInput) => {
  const targetTicket = findTicketByPnr(list, pnrInput);
  if (!targetTicket) {
    console.log(`[ERROR]: Khong tim thay ve voi ma PNR "${pnrInput}".`);
    return false;
  }

  if (targetTicket.status === "CANCELLED") {
    console.log(`[ERROR]: Ve ${targetTicket.pnr} da bi huy, khong the check-in.`);
    return false;
  }

  const baggage = Number(baggageKgInput);
  if (isNaN(baggage) || baggage < 0) {
    console.log("[ERROR]: Can nang hanh ly khong hop le.");
    return false;
  }

  targetTicket.checkedBaggageKg = baggage;
  targetTicket.excessFee = calculateExcessBaggageFee(targetTicket.classTier, baggage);
  targetTicket.status = "CHECKED_IN";

  console.log(`[SUCCESS]: Check-in thanh cong cho hanh khach "${targetTicket.passengerName}".`);
  displayBoardingPass(targetTicket);
  return true;
};

// SEARCH TICKET: Tra cuu thong tin ve theo PNR hoac Ten
const searchTicket = (list, keyword) => {
  if (!keyword || keyword.trim() === "") {
    console.log("[ERROR]: Tu khoa tra cuu khong duoc de rong.");
    return;
  }

  const cleanKeyword = keyword.trim().toUpperCase();
  const results = [];

  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (t.pnr.toUpperCase().includes(cleanKeyword) || t.passengerName.toUpperCase().includes(cleanKeyword)) {
      results.push(t);
    }
  }

  if (results.length === 0) {
    console.log(`[INFO]: Khong tim thay ve phu hop voi tu khoa "${keyword}".`);
  } else {
    listTickets(results);
  }
};

// CANCEL TICKET: Huy ve theo yeu cau
const cancelTicket = (list, pnrInput) => {
  const targetTicket = findTicketByPnr(list, pnrInput);
  if (!targetTicket) {
    console.log(`[ERROR]: Khong tim thay ve voi ma PNR "${pnrInput}" de huy.`);
    return false;
  }

  if (targetTicket.status === "CANCELLED") {
    console.log(`[INFO]: Ve ${targetTicket.pnr} da o trang thai huy tu truoc.`);
    return true;
  }

  targetTicket.status = "CANCELLED";
  console.log(`[SUCCESS]: Da huy thanh cong ve PNR "${targetTicket.pnr}" cua "${targetTicket.passengerName}".`);
  return true;
};

// 3. XAY DUNG GIAO DIEN CONSOLE MENU DIEU HUONG
const showMenu = () => {
  console.log("\n================================================");
  console.log("       HE THONG QUAN LY CHECK-IN SAN BAY        ");
  console.log("================================================");
  console.log("1. Xem danh sach ve chuyen bay");
  console.log("2. Tiep nhan check-in, can han ly va tinh phi");
  console.log("3. Tra cuu ve theo ma PNR hoac Ten");
  console.log("4. Huy ve / Doi trang thai ve");
  console.log("5. Thoat ca lam việc");
  console.log("================================================");
};

const promptUserMenu = () => {
  showMenu();
  rl.question("Chon chuc nang (1-5): ", (answer) => {
    const choice = answer.trim();

    switch (choice) {
      case "1": {
        listTickets(flightTickets);
        promptUserMenu();
        break;
      }

      case "2": {
        rl.question("Nhap ma PNR can check-in (VD: VJ101): ", (pnrInput) => {
          rl.question("Nhap trong luong hanh ly ky gui (kg): ", (baggageInput) => {
            checkInPassenger(flightTickets, pnrInput, baggageInput);
            promptUserMenu();
          });
        });
        break;
      }

      case "3": {
        rl.question("Nhap ma PNR hoac Ten hanh khach can tim: ", (keywordInput) => {
          searchTicket(flightTickets, keywordInput);
          promptUserMenu();
        });
        break;
      }

      case "4": {
        rl.question("Nhap ma PNR can huy ve (VD: VJ101): ", (pnrInput) => {
          cancelTicket(flightTickets, pnrInput);
          promptUserMenu();
        });
        break;
      }

      case "5": {
        console.log("\nKet thuc ca lam viec tai quay check-in. Tam biet!");
        rl.close();
        break;
      }

      default: {
        console.log("[ERROR]: Lua chon khong hop le. Vui long chon tu 1 den 5.");
        promptUserMenu();
        break;
      }
    }
  });
};

// 4. KHOI DONG CHUONG TRINH CLI
console.log("Khoi dong he thống Quản lý Vé máy bay & Hành lý ký gửi...");
promptUserMenu();