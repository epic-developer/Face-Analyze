var level2;
var open = true;
var validFaces = [];
var mainFace = '';
var iteration;
var faceMatcher;
var scanLoop;
var total;

console.log('Based on Github: justadudewhohacks/face-api.js');

function displayResults() {
    clearInterval(scanLoop);
    validFaces.sort(function(a, b) {
        return Number(a.score) - Number(b.score);
    });
    document.body.innerHTML = "<center><div id='Main'></div></center>";
    var span = document.createElement('SPAN');
    span.style = 'font-family:Orbitron;color:white;font-size:240%;cursor:default';
    span.innerHTML = 'Results';
    document.getElementById('Main').appendChild(span);
    document.getElementById('Main').appendChild(document.createElement('BR'));
    document.getElementById('Main').appendChild(document.createElement('BR'));
    document.getElementById('Main').appendChild(document.createElement('BR'));
    if (validFaces.length == 0) {
        var span = document.createElement('SPAN');
        span.style = 'font-family:Orbitron;color:white;font-size:140%;cursor:default';
        span.innerHTML = 'No Similar Faces Identified for:';
        document.getElementById('Main').appendChild(span);
        document.getElementById('Main').appendChild(document.createElement('BR'));
        var face = document.createElement('IMG');
        face.src = mainFace;
        document.getElementById('Main').appendChild(face);
    }
    else {
        for (var i = 0; i < validFaces.length; i++) {
            var face = document.createElement('IMG');
            face.src = mainFace;
            document.getElementById('Main').appendChild(face);
            var face = document.createElement('IMG');
            face.src = validFaces[i].url;
            face.setAttribute('crossorigin', 'anonymous');
            document.getElementById('Main').appendChild(face);
            document.getElementById('Main').appendChild(document.createElement('BR'));
            var span = document.createElement('SPAN');
            span.style = 'font-family:Orbitron;color:white;font-size:140%;cursor:default';
            span.innerHTML = validFaces[i].score + ' similar';
            document.getElementById('Main').appendChild(span);
            document.getElementById('Main').appendChild(document.createElement('BR'));
            document.getElementById('Main').appendChild(document.createElement('BR'));
        }
    }
}

async function scan(url) {
    open = false;
    document.body.innerHTML = "<center><div id='Main'></div></center>";
    var face = document.createElement('IMG');
    face.src = mainFace;
    face.id = 'tempFace1';
    document.getElementById('Main').appendChild(face);

    var face2 = document.createElement('IMG');
    face2.src = url;
    face2.id = 'tempFace2';
    face2.setAttribute('crossorigin', 'anonymous');
    document.getElementById('Main').appendChild(face2);

    document.getElementById('Main').appendChild(document.createElement('BR'));

    var span = document.createElement('SPAN');
    span.style = 'font-family:Orbitron;color:white;font-size:120%;cursor:default';
    span.id = 'status';
    span.innerHTML = 'Analyzing... ' + String(iteration + 1) + ' out of ' + total;
    document.getElementById('Main').appendChild(span);

    if (iteration == 0) {
        var results = await faceapi
            .detectAllFaces('tempFace1')
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (!results.length) {
            alert('Invalid image uploaded. Face not found.');
            return;
        }

        faceMatcher = new faceapi.FaceMatcher(results);
    }

    var singleResult = await faceapi
        .detectSingleFace('tempFace2')
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (singleResult) {
        var bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
        //if (bestMatch['_label'] == 'unknown') {
        if (bestMatch['_distance'] >= level2) {
            document.getElementById('status').innerHTML = 'No similarities detected';
            setTimeout(function() {
                open = true;
            }, 500);
        }
        else if (bestMatch['_distance'] < level2) {
            var score = String(((1 - bestMatch['_distance']) * 100).toFixed(2));
            if (score > 60) {
                score += 10;
            }
            document.getElementById('status').innerHTML = 'The AI is ' + score + "% confident that the detected faces are the same person";
            validFaces.push({
                url: url,
                score: score + '%'
            });
            setTimeout(function() {
                open = true;
            }, 2000);
        }
    }
    else {
        open = true;
    }
}

async function query(url, level) {
    if (url == "") {
        alert('Please enter a URL');
        return;
    }
    if (level == "") {
        level2 = 0.5;
    }
    else {
        level2 = Number(level);
    }
    var fileSelected = document.getElementById('face').files;
    if (fileSelected.length > 0) {
        var fileToLoad = fileSelected[0];
        var fileReader = new FileReader();
        fileReader.onload = async function(faceURL) {
            mainFace = faceURL.target.result;
            document.getElementById('btn').innerHTML = "Loading...";
            document.getElementById('btn').style = "cursor:default";
            document.getElementById('btn').onclick = function() { };
            //new faceapi.SsdMobilenetv1Options({ minConfidence: level2 })

            const MODEL_URL = '/models';

            await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
            await faceapi.loadFaceLandmarkModel(MODEL_URL);
            await faceapi.loadFaceRecognitionModel(MODEL_URL);

            var xhttp;
            if (window.XMLHttpRequest) {
                xhttp = new XMLHttpRequest();
            }
            else {
                xhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var data = this.responseText;
                    var images = [];
                    data.split(' ').forEach(function(item, index) {
                        try {
                            item2 = item.split('src="')[1].split('"')[0];
                            if (item2 != '' && (item2.includes('.jpg') || item2.includes('.png'))) {
                                if (item2.includes('https://') || item2.includes('http://')) {
                                    images.push('https://face-analyze.davidfahim.repl.co/get?url=' + item2);
                                    //images.push(item2);
                                }
                                /*else {
                                    var url2;
                                    if (item2.substring(0, 2) == './') {
                                        item2 = item2.substring(2);
                                        var index1 = url.indexOf('.com');
                                        var index2 = url.indexOf('.net');
                                        var index3 = url.indexOf('.org');
                                        if (index1 != -1){
                                            url = url.substring(0, index1 + 4);
                                        }
                                        else if (index2 != -1){
                                            url = url.substring(0, index2 + 4);
                                        }
                                        else if (index3 != -1){
                                            url = url.substring(0, index3 + 4);
                                        }
                                        if (url[url.length - 1] != '/') {
                                            url2 = url + '/';
                                        }
                                        else {
                                            url2 = url;
                                        }
                                    }
                                    else if (item2.substring(0, 1) == '/') {
                                        item2 = item2.substring(1);
                                        url2 = url.split('/');
                                        url2 = url2.splice(url2.length - 1, 1)
                                        url2 = url2.join('/');
                                        if (url[url.length - 1] != '/') {
                                            url2 = url + '/';
                                        }
                                        else {
                                            url2 = url;
                                        }
                                    }
                                    else {
                                        item2.substring(2);
                                        var index1 = url.indexOf('.com');
                                        var index2 = url.indexOf('.net');
                                        var index3 = url.indexOf('.org');
                                        var index3 = url.indexOf('.co');
                                        if (index1 != -1){
                                            url = url.substring(0, index1 + 4);
                                        }
                                        else if (index2 != -1){
                                            url = url.substring(0, index2 + 4);
                                        }
                                        else if (index3 != -1){
                                            url = url.substring(0, index3 + 4);
                                        }
                                        else if (index4 != -1){
                                            url = url.substring(0, index4 + 3);
                                        }
                                        if (url[url.length - 1] != '/') {
                                            url2 = url + '/';
                                        }
                                        else {
                                            url2 = url;
                                        }
                                    }
                                    try{
                                        item2 = item2.split('?')[0];
                                    }
                                    catch(error){
                                        //
                                    }
                                    images.push(url2 + item2);
                                }*/
                            }
                        }
                        catch (error) {
                            //
                        }
                    });
                    total = String(images.length);
                    iteration = -1;
                    scanLoop = setInterval(function() {
                        if (open == true) {
                            iteration += 1;
                            if (images[iteration] != undefined) {
                                scan(images[iteration]);
                            }
                            else {
                                displayResults();
                            }
                        }
                    }, 100);
                }
            };
            xhttp.open("GET", 'https://face-analyze.davidfahim.repl.co/get?url=' + url, true);
            xhttp.send();
        };
        fileReader.readAsDataURL(fileToLoad);
    }
    else {
        alert("Upload an image");
    }
}