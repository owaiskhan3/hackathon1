var done = document.getElementById("done");
var uuid;
(async function getUid() {
  var uid = await db
    .collection("uid")
    .doc("uid")
    .get();
  console.log(uid);
  var data = await uid.data();
  console.log(data);

  uuid = await data.uid;
})();

var showToken = document.getElementById("currToken");
var key;
setTimeout(async () => {
  console.log(uuid);
  var data = await db
    .collection("customerTokens")
    .doc(uuid)
    .get()
    .then(res => {
      console.log(res);
      return res;
    });

  var data1 = await data.data();
  document.getElementById("totalTokens").value = data1.tokenLimits;
  console.log(data1);
  var obj = new Object(data1.userInfo[0]);
  console.log(obj);
  key = Object.keys(obj);
  document.getElementById("estimatedTime").value = data1.estimatedTime;
  showToken.innerHTML = `<h1>${key}</h1><br /><p>Completed: ${obj[key].isDone}</p>`;
}, 4000);

done.addEventListener("click", async () => {
  var totalTokenLimit = document.getElementById("totalTokens").value;
  var estimatedTime = document.getElementById("estimatedTime").value;
  console.log(totalTokenLimit);
  console.log(estimatedTime);
  console.log(uuid);
  var idd = await db.collection("userId").get();
  var ids = await idd.docs[0].id;
  console.log(ids);
  var obj = new Object();
  key = Object.keys(obj);
  key = ids;
  obj[key] = {
    isDone: true
  };
  await db
    .collection("customerTokens")
    .doc(uuid)
    .set(
      {
        estimatedTime: estimatedTime,
        tokenLimits: totalTokenLimit - 1,
        userInfo: [obj]
      },
      {
        merge: true
      }
    );

  swal.fire("Successfully Updated Token", "Token turn completed", "success");

  await db
    .collection("customerTokens")
    .doc(uuid)
    .set(
      {
        userInfo: []
      },
      {
        merge: true
      }
    );

  //   console.log(tokens);
  //   var data = await tokens.data();
  //   console.log(data);
});
