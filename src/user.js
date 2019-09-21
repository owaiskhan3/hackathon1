let cont = document.getElementById("tbl");
var inp = document.getElementById("myInput");
var btn = document.getElementById("btn");
const btn1 = document.getElementById("logout");
btn1.addEventListener("click", signout);
var company;

btn.addEventListener("click", search);

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

async function search() {
  try {
    await db.collection("companies").onSnapshot(e => {
      console.log(e);
      cont.innerHTML = "";
      e.forEach(i => {
        console.log(i.data());
        console.log(i.id);
        console.log(inp.value);
        if (inp.value == i.data().companyName) {
          cont.innerHTML += `
          <thead>
            <th>Company Name</th>
            <th>Created At</th>
            <th>Since</th>
            <th></th>
            </thead>
            <tbody>
            <tr>
            <td>${i.data().companyName} </td>
            <td>${new Date(i.data().createdAt)} </td>
            <td>${i.data().since} </td>
  
                   
            <td><button id=${
              i.data().createdAt
            } class="btn btn-warning" onclick="getToken('${
            i.id
          }')">Get Token</button></td>
            </tr>
            </tbody>`;
          initMap(i.data().lat, i.data().lng);
        }
      });
    });
  } catch (err) {
    cont.innerHTML += err;
  }
}
{
  // <th>Total Tokens</th>
  // <th>Current Tokens</th>
  /* <td>${i.data().totalTokens} </td>
<td>${i.data().CurrentTokens} </td> */
}
async function initMap(lat, lng) {
  console.log(lat, lng);
  locLat = lat;
  LocLng = lng;
  // The location of Uluru
  var uluru = { lat, lng };
  // The map, centered at Uluru
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: uluru
  });
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({ position: uluru, map: map });
}

async function getToken(id) {
  console.log(id);
  await db
    .collection("uid")
    .doc("uid")
    .set({ uid: id });
  var today = new Date();
  console.log(today);
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(time);
  var uid = await db
    .collection("userId")
    .get()
    .then(e => {
      console.log(e.docs[0].id);
      return e.docs[0].id;
    });
  console.log(uid);

  var tokenTime = await db
    .collection("customerTokens")
    .doc(uuid)
    .get();
  var ids = await tokenTime.data();
  console.log(ids.estimatedTime);
  var totalTokens = ids.tokenLimits - 1;
  document.getElementById("timer").innerHTML = ids.estimatedTime + ":" + 00;

  db.collection("customerTokens")
    .doc(id)
    .set(
      {
        createdAt: time,
        // estimatedTime: 1,
        tokenLimits: totalTokens,
        userInfo: firebase.firestore.FieldValue.arrayUnion({
          [uid]: {
            isDone: false
          }
        })
      },
      {
        merge: true
      }
    )
    .then(() => {
      Swal.fire("Token Generated", "", "success");
    });

  var divCancel = document.getElementById("cancelbutn");
  divCancel.innerHTML = "";

  divCancel.innerHTML = `<button class="btn btn-danger" onclick="cancelToken()">Cancel Token</button>`;
  startTimer();
}
async function cancelToken() {
  document.getElementById("timer").innerHTML = "";

  var idd = await db
    .collection("uid")
    .doc("uid")
    .get();
  var ids = await idd.data();
  console.log(ids);

  await db
    .collection("customerTokens")
    .doc(ids.uid)
    .set(
      {
        userInfo: []
      },
      {
        merge: true
      }
    );

  Swal.fire("Token Cancelled", "Token has been Cancel", "success");
}

async function startTimer() {
  var presentTime = document.getElementById("timer").innerHTML;
  var timeArray = presentTime.split(/[:]+/);
  var m = timeArray[0];
  var s = checkSecond(timeArray[1] - 1);
  if (s == 59) {
    m = m - 1;
  }
  if (m == 0 && s == 00) {
    Swal.fire(
      "Your turn has Arrived",
      "Please proceed to respective Counter",
      "success"
    );
    // setTimeout(stop(), 500);
    document.getElementById("timer").innerHTML = m + ":" + s;

    var idd = await db
      .collection("uid")
      .doc("uid")
      .get();
    var ids = await idd.data();
    console.log(ids);
    // var obj = new Object();
    // key = Object.keys(obj);
    // key = ids;
    // obj[key] = {
    //   isDone: true
    // };
    await db
      .collection("customerTokens")
      .doc(ids.uid)
      .set(
        {
          userInfo: []
        },
        {
          merge: true
        }
      );
  }
  //if(m<0){alert('timer completed')}
  else {
    document.getElementById("timer").innerHTML = m + ":" + s;
    setTimeout(startTimer, 1000);
  }

  function checkSecond(sec) {
    if (sec < 10 && sec >= 0) {
      sec = "0" + sec;
    }
    // add zero in front of numbers < 10
    if (sec < 0) {
      sec = "59";
    }
    return sec;
  }
}

async function signout(e) {
  e.preventDefault();

  try {
    await logOut();
    Swal.fire("Successfully LoggedOut!", "", "success");
    setTimeout(() => {
      location.assign("../index.html");
    }, 2000);
  } catch (e) {
    Swal.fire("Error", error.message, "error");
  }
}
