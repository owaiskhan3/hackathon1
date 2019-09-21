const saveCompany = document.getElementById("saveCompany");
saveCompany.addEventListener("click", save);
const btn = document.getElementById("logout");
btn.addEventListener("click", signout);

let companyName = document.getElementById("company");
let startYear = document.getElementById("year");
let time = document.getElementById("time");

var imgEncoded;
var file = document.querySelector("input[type=file]"); // File refrence
const container = document.getElementsByClassName("container");

async function uploadImage(blob) {
  var num = Math.random();
  try {
    await storage
      .ref()
      .child(`${num}.png`)
      .put(blob);

    const url = await storage
      .ref()
      .child(`${num}.png`)
      .getDownloadURL();
    return url;
  } catch (err) {
    throw err;
  }
}

function openFile(arr) {
  var imagesArr = [];
  if (arr.length <= 3) {
    for (var item of arr) {
      imagesArr.push(uploadImage(item));
    }
    return Promise.all(imagesArr);
  } else {
    Swal.fire("Error..", "Please choose atmost 3 images", "error");
  }
}

let locLat, LocLng;
async function save() {
  if (
    companyName.value !== "" &&
    startYear.value !== "" &&
    time.value !== "" &&
    file.value !== ""
  ) {
    console.log(companyName.value);
    console.log(startYear.value);
    console.log(time.value);
    var dataFiles = await openFile(file.files);
    console.log(dataFiles);

    db.collection("companies")
      .doc()
      .set(
        {
          companyName: companyName.value,
          since: startYear.value,
          imgEncoded: dataFiles,
          createdAt: firebase.firestore.Timestamp.now().toMillis(),
          dateAndTime: time.value.split("T"),
          lat: locLat,
          lng: LocLng
        },
        { merge: true }
      )
      .then(docRef => {
        console.log("post successfully added!");
        console.log("doc written with id ", docRef);
      })
      .catch(e => {
        e.message;
      });

    Swal.fire("Successfully Posted Post!", "", "success");
    companyName.value = "";
    time.value = "";
    startYear.value = "";
    file.value = "";
  } else {
    Swal.fire("Error..", "Please fill all fields", "error");
  }
}

db.collection("companies").onSnapshot(e => {
  container[0].innerHTML = "";

  e.forEach(i => {
    var images = "";
    // console.log("i.data() =>", i.data());
    // console.log(i.data().imgEncoded);
    i.data().imgEncoded.forEach(i => {
      images += `<img src='${i}' style="width:100px"/>`;
    });
    container[0].innerHTML += `<div class="card" style="width: 20rem; margin:auto">
               <span>${images}</span>
                <div class="card-body">
                <h3>Company Id: <p>${i.id}</p></h3>
                  <h4 class="card-text">Company Name: ${i.data().companyName ||
                    "No Post"} </h4>
                  <p><h5>Date And Time: ${i.data().dateAndTime.map(e => {
                    return e;
                  }) || "No dataAndTime"}</h5></p>
                  <p>CreatedAt: ${new Date(i.data().createdAt)}</p>

                    <button type="button" class="btn btn-primary" onclick="svChanges('${
                      i.id
                    }')">
                    Manage Tokens
                    </button>

                    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Token</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form>
                              <div class="form-group row">
                              <label for="inputTokensNum" class="col-sm-2 col-form-label">Enter today's Token counts</label>
                                <div class="col-sm-10">
                                  <input type="number" class="form-control" id="inputTokensNum" placeholder="Token Counts">
                                </div>
                              </div>
                              <div class="form-group row">
                               <label for="estimatedTime" class="col-sm-2 col-form-label">Enter today's Token counts</label>
                                  <div class="col-sm-10">
                                       <input type="number" class="form-control" id="estimatedTime" placeholder="Estimated Time for Token">
                                   </div>
                              </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="" >Save changes</button>
                        </div>
                        </div>
                    </div>
                    </div>
                  
                  <button class="btn btn-danger" onclick="deleteItem('${
                    i.id
                  }')">Delete</button><br/>
                  </div>
                  </div><br/>          `;
  });
  //   <button class="btn btn-success" onclick="addToOffline('${
  //     i.id
  //   }')">+View Later </button>
});

async function signout(e) {
  e.preventDefault();

  try {
    await logOut();
    Swal.fire("Successfully LoggedOut!", "", "success");
    setTimeout(() => {
      location.assign("index.html");
    }, 2000);
  } catch (e) {
    Swal.fire("Error", error.message, "error");
  }
}

async function deleteItem(id) {
  console.log(id);

  Swal.fire("Success", "Delete Succesfully", "success");
  await db
    .collection("companies")
    .doc(id)
    .delete();
}
// const inpTokenNum = document.getElementById("inputTokensNum");
// const estimatedTime = document.getElementById("estimatedTime");
// const saveChanges = document.getElementById("saveChanges");
// saveChanges.addEventListener("click", svChanges);

async function svChanges(id) {
  console.log(id);
  await db
    .collection("uid")
    .doc("uid")
    .set({ uid: id });
  location.assign("./tokens.html");
}

function initMap(lat, lng) {
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

async function handleSearch() {
  let searchText = document.querySelector("#search-input").value;
  if (!!searchText.trim().length) {
    let result = await fetchLocation(searchText);
    const {
      response: { venues }
    } = result;
    const location = venues[0].location;

    initMap(location.lat, location.lng);
  }
}

var location_map = document.getElementById("selectLoc");
console.log(location_map);

// const endPoint = "https://api.foursquare.com/v2/venues/search";
// const params = {
//   client_id: "WGJ241BMWITD5YCRRCVCX0NYRE2KINA3OMKZHPYHQ54LMCMO",
//   client_secret: "M0XIH2BH0YMPJGEB11RVCCFRQNCAJ2AMY1T2Q3C4QXC4KPAY"
// };

async function fetchLocation(place) {
  let coords = await getUsersLocation();
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.foursquare.com/v2/venues/search?client_id=WGJ241BMWITD5YCRRCVCX0NYRE2KINA3OMKZHPYHQ54LMCMO&client_secret=M0XIH2BH0YMPJGEB11RVCCFRQNCAJ2AMY1T2Q3C4QXC4KPAY&v=20180323&near=${coords.latitude},${coords.longitude}&query="${place}"&limit=1`
    )
      .then(res => res.json())
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

function getUsersLocation() {
  return new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(position => {
      res(position.coords);
    });
  });
}

// fetch(
//   `https://api.foursquare.com/v2/venues/search?client_id=WGJ241BMWITD5YCRRCVCX0NYRE2KINA3OMKZHPYHQ54LMCMO&client_secret=M0XIH2BH0YMPJGEB11RVCCFRQNCAJ2AMY1T2Q3C4QXC4KPAY&v=20180323&ll=24.9101315,67.0769679&query=""`
// )
//   .then(res => res.json())
//   .then(res => {
//     console.log(res);
//     // console.log(res.response.venues.map(loc => loc.location.lat));
//     res.response.venues.map(venue => {
//       location_map.innerHTML += `<option>${venue.name}</option>`;
//       initMap(venue.location.lat, venue.location.lng);
//     });
//     console.log(res.response.venues[1].location);
//     var loc = res.response.venues[1].location;
//   });

// getVenues();
