let userinput = document.getElementById("date");
let result=document.getElementById("result");
userinput.max = new Date().toISOString().split("T")[0];

function calculateage() {
  let birthdate = new Date(userinput.value);
  let d1 = birthdate.getDate();
  let m1 = birthdate.getMonth() + 1; // getMonth is 0-indexed
  console.log(m1);
  let y1 = birthdate.getFullYear();  // Fixed: added ()

  let today = new Date();
  let d2 = today.getDate();
  let m2 = today.getMonth() + 1;
  let y2 = today.getFullYear();

  let d3, m3, y3;
  y3 = y2 - y1;//2025-2004 =20 5-1 ..4

  if (m2 >= m1) {
    m3 = m2 - m1;
  } else {
    y3--;
    m3 = 12 + m2 - m1;
  }
  console.log(m3)

  if (d2 >= d1) {//17-10=7
    d3 = d2 - d1;
  } else {
    if (m3 === 0) {
      m3 = 11;
      y3--;
    } else {
      m3--;
    }
    d3 = getDaysInMonth(y2, m2 - 1) + d2 - d1; // Fixed: correct month for previous
    console.log(d3)
  }
  result.textContent=`You are ${y3} years, ${m3} months, and ${d3} days old.`

}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}