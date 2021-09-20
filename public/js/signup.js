const form = document.querySelector("form");
const emailError = document.querySelector(".email.error");
const passwordError = document.querySelector(".password.error");
const nameError = document.querySelector(".name.error");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // reset errors
  emailError.textContent = "";
  passwordError.textContent = "";
  // get values
  const email = form.email.value;
  const password = form.password.value;
  const secPassword = form.secPassword.value;
  const name = form.name.value;
 
    try {
      const res = await fetch("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name ,secPassword}),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      if (data.errors) {
        emailError.textContent = data.errors.email;
        passwordError.textContent = data.errors.password;
        nameError.textContent = data.errors.name;
      }
      if (data.user) {
        location.assign("/");
      }
    } catch (err) {
      console.log(err);
    }
 
});
