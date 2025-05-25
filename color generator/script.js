
document.getElementById("btn").addEventListener("click",()=>{
 const randomnum=Math.floor(Math.random()*1677215);
 const rancolor="#" + randomnum.toString(16).padStart(6,"0");
 document.body.style.backgroundColor=rancolor;
 document.getElementById("color-code").textContent='#'+ rancolor;
 navigator.clipboard.writeText(rancolor);
});
// const getColor=()=>{
//     const ran=Math.floor(Math.random()*16777215);
//     const randomColor="#"+ran.toString(16);
//     document.getElementById("color-code").textContent="#"+ran;
//     document.style.backgroundColor=randomColor;
// }
// document.getElementById("btn").addEventListener("click",getColor);
// getColor();
// document.getElementById("btn").addEventListener("click", () => {
//   // Generate a random number between 0 and 16777215 (0xFFFFFF)
//   const randomNum = Math.floor(Math.random() * 16777215);
  
//   // Convert to hex and pad with zeros if needed
//   const hexColor = "#" + randomNum.toString(16).padStart(6, '0');

//   // Change background color
//   document.body.style.backgroundColor = hexColor;

//   // Show hex color code in the element
//   document.getElementById("color-code").textContent = hexColor;

//   // Copy to clipboard
//   navigator.clipboard.writeText(hexColor)
//     .then(() => console.log("Color copied to clipboard!"))
//     .catch(err => console.error("Failed to copy:", err));
// });
