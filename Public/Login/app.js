// ===== ELEMENT REFERENCES =====
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const startNow = document.getElementById('startNow');
let method = 'login'

// ===== TOGGLE LOGIN / SIGNUP =====
showSignup.addEventListener('click', function (e) {
  e.preventDefault();
  method = 'login' ? 'signup' : 'login'
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
});

showLogin.addEventListener('click', function (e) {
  e.preventDefault();
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

// ===== "START NOW" SCROLLS FOCUS TO FORM =====
startNow.addEventListener('click', function (e) {
  e.preventDefault();
  // If on signup, switch back to login first
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  // Focus the username field
  document.getElementById('loginUser').focus();
});


// ===== LOGIN SUBMIT =====
loginForm.addEventListener('submit', async (e)=> {
  e.preventDefault();
  var email = document.getElementById('loginUser').value.trim();
  var password = document.getElementById('loginPass').value;


  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }
  const reqBody = {email,password}

  try{
    const response = await fetch(`${window.location.origin}/api/v1/auth/login`,{
      method:'POST',
      body:JSON.stringify(reqBody),
      headers:{
        'Content-Type': 'application/json'},
    })

    const result= await response.json()

   
    if(response.ok){
      localStorage.setItem('userFolders', JSON.stringify(result.folders))
      window.location.assign('/home')
    }
  }catch(err){
    console.log(`Error Fetching: ${err}`)
  }
  
  // Replace this with your actual login logic
});

// ===== SIGNUP SUBMIT =====
signupForm.addEventListener('submit', async (e)=> {
  e.preventDefault();
  var name = document.getElementById('signupUser').value.trim();
  var email = document.getElementById('signupEmail').value.trim();
  var password = document.getElementById('signupPass').value;
  var confirmPassword = document.getElementById('signupConfirmPass').value;
  
  if (!name || !email || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }
  
  const reqBody= {name,email,password, confirmPassword}
  
  try{
    const response = await fetch(`${window.location.origin}/api/v1/auth/signup`,{
      method:'POST',
      body:JSON.stringify(reqBody),
      headers:{'Content-Type':'application/json'}
    })
    const result=  await response.json()
    
    console.log(`Result From signup Form: ${JSON.stringify(result)}`)
    localStorage.setItem('savedFolder', JSON.stringify(result.savedFolder.id))
    if(response.ok){

      window.location.assign('/home')
    }
  }catch(err){
    console.log(`Error on signup: ${err}`)
  }
  
  // Replace this with your actual signup logic
  // console.log('Signup attempt:', username, email);
  // alert('Account created for ' + username);
  
  // Switch back to login after signup
});