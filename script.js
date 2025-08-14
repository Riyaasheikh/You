let min = 1;
let max = 100;
let attempts = 0;
let rand = Math.floor(Math.random() * (max - min )) + min;
console.log(rand);

let guess;
while (true) {
    guess = window.prompt(`Enter a number between ${min} and ${max}`);
    
    // Handle cancel button
    // if (guess === null) break;
    
    // Input validation
    if (guess === "" || isNaN(guess)) {
        alert("Please enter a valid number");
        continue;
    }
    
    guess = parseInt(guess);
    
    if (guess < min || guess > max) {
        alert(`Please enter a number between ${min} and ${max}`);
        continue;
    }
    
    attempts++;
    
    // Using switch with true to compare conditions
    switch (true) {
        
        case (guess < rand):
            alert('Too low');
            continue;
        
        case (guess > rand):
            alert('Too high');
            continue;
         case (guess === rand):
            alert(`Congratulations! You guessed the number ${rand} in ${attempts} attempts.`);
            bresk; // Exit the loop
    }
    if(guess===rand){
        break;
    }
}