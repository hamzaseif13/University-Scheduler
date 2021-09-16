const form = document.getElementById("setForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.name.value;
  const oldPass = form.oldPass.value;
  const newPass1 = form.newPass1.value;
  const newPass2 = form.newPass2.value;

  try {
   const res= await fetch("/checkSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({name,oldPass,newPass1,newPass2}),
    });
    const data = await res.json();
    if(data.errors){
        document.getElementById("nameE").innerHTML=`<h2 class="text-danger">${data.errors.name}</h2>`
        document.getElementById("passE").innerHTML=`<h2 class="text-danger">${data.errors.password}</h2>`
    }
  } catch (err) {
    console.log(err);
  }
});
