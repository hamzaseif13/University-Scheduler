const form = document.getElementById("setForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.name.value;
  let isPass=true;
  const oldPass = form.oldPass.value;
  const newPass1 = form.newPass1.value;
  const newPass2 = form.newPass2.value;
  document.getElementById("nameE").innerHTML=""
  document.getElementById("passE").innerHTML=""
  if(!newPass1&&!newPass2&&!oldPass)isPass=false;
  try {
   const res= await fetch("/checkSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({name,oldPass,newPass1,newPass2,isPass}),
    });
    const data = await res.json();
    if(data.namePassChanges){
      if(data.namePassChanges.name)
      document.getElementById("nameE").innerHTML=`<h2 class="text-success">name has been changed </h2>`
      if(data.namePassChanges.password)
      document.getElementById("passE").innerHTML=`<h2 class="text-success">password has been changed </h2>`
    }
    
    if(data.errors){
        document.getElementById("nameE").innerHTML=`<h2 class="text-danger">${data.errors.name}</h2>`
        document.getElementById("passE").innerHTML=`<h2 class="text-danger">${data.errors.password}</h2>`
    }
  } catch (err) {
    console.log(err);
  }
});
