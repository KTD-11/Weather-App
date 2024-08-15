let temp = document.querySelector('div.forecast h1'), loc = document.querySelector('div.forecast span'), tz = document.querySelector('div.forecast p'), humidity = document.querySelector('div.forecast h4'), icon = document.querySelector(`img`);


function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}


async function getData() {
    
    try{

        let hPosition = await getLocation();

        let response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${hPosition.latitude}%2C%20${hPosition.longitude}?unitGroup=us&key=${config.apiKey}&contentType=json`)
        
        if (!response.ok) {
            throw new Error(`Response isn't ok: ${response.status}`);
        }

        let text = await response.text(), ptext = JSON.parse(text);
        temp.innerText = `${Math.round((ptext.currentConditions.temp - 32)/(9/5))}°C`, loc.innerText = ptext.currentConditions.conditions, tz.innerText = ptext.timezone, humidity.innerText = `Humidity : ${ptext.currentConditions.humidity}`, icon.src = `/visualCrossingIcons/${ptext.currentConditions.icon}.png` ; console.log(ptext);
        
        return ptext;
    }

    catch(err){
        console.log(`there's an error ${err}`)
    }
}

async function displayGraph() {
    try{
        const ctx = document.getElementById('chart');

        let data = await getData(); const arr = [data.currentConditions.temp, data.days[1].temp, data.days[2].temp, data.days[3].temp, data.days[4].temp, data.days[5].temp];
        let tempsInCelsius = arr.map((x) => (x - 32)/(9/5)) 
        
        new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Today', 'Tomorrow', 'In two days', 'In three days', 'In four days', 'In five days'],
              datasets: [{
                label: 'Temperature',
                data: tempsInCelsius,
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                
                responsive: true
                  
            }
          });
    
    }

    catch(err){
        console.log(`an error occured ${err}`)
    }
}


async function displayMap(){

    try{

        let position = await getLocation();
        console.log(position)

        map = L.map('map', {
            center: [position.latitude, position.longitude],
            zoom: 13
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }

    catch(err){
        console.log(`the map is fucked ${err}`)
    }
}

async function init() {
    await getData();
    await displayGraph();
    await displayMap();
}

init()




