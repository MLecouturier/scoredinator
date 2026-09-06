SVG.on(document, 'DOMContentLoaded', function() {

    var scoreW = document.getElementById('score').offsetWidth;
    var scoreH = document.getElementById('score').offsetHeight;

    // Players management vars
    var player = 0;
    var players = parseInt(document.getElementById('players').value);
    var starting_player = getRandomInt(0, players);
    var pPaths = [];

    // Path design vars
    var duration = parseInt(document.getElementById('duration').value);    
    var steps = parseInt(document.getElementById('max-steps').value);
    var step = scoreW / (steps+2);
    var timeStep = scoreW / (duration+2);
    var draw_more = 0;
    var sine = false;
    var square = false;
    var triangle = true;
    var legend = false;
    var splitView = false;

    // Animation vars
    var a_duration = 0;
    var mask = '';
    var isPlaying = 0;
    var animReady = 0;
    
    // SVG container definition
    var draw = SVG().addTo('#score').size('100%', '100%').viewbox('0 0 '+ scoreW + ' ' + scoreH).attr({preserveAspectRatio: 'xMinYMid slice', id: 'score-svg'});

    function drawScore(starting_point = 0) {

        if (!animReady) {
            initPlay();
            animReady = 1;
        }        

        // Update Steps and Step value
        steps = parseInt(document.getElementById('max-steps').value);
        step = scoreW / (steps+2);
        timeStep = (scoreW - 2*step) / duration;

        let vStep = scoreH / 3;
        let svStep = scoreH / (players + 2);    // Vertical Step for Split view

        // console.log("Current Player:" + player);

        // Define available path form(s)
        var waveforms = [];
        if( sine ) waveforms.push("sine");
        if( square ) waveforms.push("square");
        if( triangle ) waveforms.push("triangle");

        // Define a Starting point between 0 and max steps
        if( starting_point == 0) {
            if( player == starting_player ) {
                starting_point = 1;
            } else {
                starting_point = getRandomInt(1, steps/2);
            }
        } 

        let offset = player * 18;
        let startOffset = (player+1) * 9;
        let sOffset = player * svStep + 30; //Offset for split player view

        if(player >= players) {
            return;
        } else {
            player++;
        }          
            
        // Move to starting point
        let points = 'M' + (starting_point * step) + ' ' + (startOffset + 32);
        let aPoints = points;   // Alternative path for split player view
        
        let cLine = 0;

        for( let pointer = starting_point; pointer <= steps + 1; pointer++ ) {

            // Randomly determine which direction to follow 
            // direction between 1 and 4 --> Follow first line
            // direction between 5 and 8 --> Follow second line
            // direction = 9 --> Exit
            let direction = getRandomInt(1, 10); // Get a direction between 1 and 9

            // If last step => force the exit
            if ( pointer == steps + 1 ) direction = 9;

            if ( pointer == starting_point ) {
                // Enter the score
                direction = direction <= 4 ? 1 : 2;
                points = points + ' L'+ (pointer * step) + ' ' + (direction * vStep + offset);
                points = points + ' L'+ ((pointer + 1) * step) + ' ' + (direction * vStep + offset);

                aPoints = aPoints + ' L'+ (pointer * step) + ' ' + (direction * svStep + sOffset - (direction*8-8));
                aPoints = aPoints + ' L'+ ((pointer + 1) * step) + ' ' + (direction * svStep + sOffset - (direction*8-8));
                // Keep trace of the starting line
                cLine = direction;

            } else if ( direction <= 4 ) {
                // Follow the first line
                if( cLine == 1 ) {
                    // Continue on the same path
                    points = points + ' L'+ ((pointer + 1) * step) + ' ' + (vStep + offset);
                    aPoints = aPoints + ' L'+ ((pointer + 1) * step) + ' ' + (svStep + sOffset);
                    continue
                }

                // Choose a waveform in available waveforms and draw next section of the path
                let waveform = waveforms[Math.floor(Math.random()*waveforms.length)];
                if( waveform == "sine" ) {
                    points = points + ' C '+ ((pointer + 1) * step - step/2) + ' ' + ((vStep * 2) + offset) + ', ' 
                        + ((pointer) * step  + step/2) + ' ' + (vStep + offset) + ', '
                        + ((pointer + 1) * step) + ' ' + (vStep + offset); //C x1 y1, x2 y2, x y

                    aPoints = aPoints + ' C '+ ((pointer + 1) * step - step/2) + ' ' + ((svStep * 2) + sOffset - 8) + ', ' 
                        + ((pointer) * step  + step/2) + ' ' + (svStep + sOffset) + ', '
                        + ((pointer + 1) * step) + ' ' + (svStep + sOffset); //C x1 y1, x2 y2, x y
                } else if( waveform == "square" ) {
                    points = points + ' L'+ ((pointer) * step + step/2) + ' ' + ((vStep * 2) + offset);
                    points = points + ' L'+ ((pointer) * step + step/2) + ' ' + (vStep + offset);
                    points = points + ' L'+ ((pointer + 1) * step) + ' ' + (vStep + offset);

                    aPoints = aPoints + ' L'+ ((pointer) * step + step/2) + ' ' + ((svStep * 2) + sOffset - 8);
                    aPoints = aPoints + ' L'+ ((pointer) * step + step/2) + ' ' + (svStep + sOffset);
                    aPoints = aPoints + ' L'+ ((pointer + 1) * step) + ' ' + (svStep + sOffset);
                } else {
                    points = points + ' L'+ ((pointer + 1) * step) + ' ' + (vStep + offset);

                    aPoints = aPoints + ' L'+ ((pointer + 1) * step) + ' ' + (svStep + sOffset);
                }

                // Keep trace of the current line
                cLine = 1;

            } else if ( direction <= 8 ) {
                // Follow the second line
                if( cLine == 2 ) {
                    // Continue on the same path
                    points = points + ' L'+ ((pointer + 1) * step) + ' ' + ((vStep * 2) + offset);
                    aPoints = aPoints + ' L'+ ((pointer + 1) * step) + ' ' + ((svStep * 2) + sOffset - 8);
                    continue
                }

                // Choose a waveform in available waveforms and draw next section of the path
                let waveform = waveforms[Math.floor(Math.random()*waveforms.length)];
                if( waveform == "sine" ) {
                    points = points + ' C '+ ((pointer + 1) * step - step/2) + ' ' + (vStep + offset) + ', ' 
                        + ((pointer) * step  + step/2) + ' ' + ((vStep * 2) + offset) + ', '
                        + ((pointer + 1) * step) + ' ' + ((vStep * 2) + offset); //C x1 y1, x2 y2, x y

                    aPoints = aPoints + ' C '+ ((pointer + 1) * step - step/2) + ' ' + (svStep + sOffset) + ', ' 
                        + ((pointer) * step  + step/2) + ' ' + ((svStep * 2) + sOffset - 8) + ', '
                        + ((pointer + 1) * step) + ' ' + ((svStep * 2) + sOffset - 8); //C x1 y1, x2 y2, x y
                } else if( waveform == "square" ) {
                    points = points + ' L'+ ((pointer) * step + step/2) + ' ' + (vStep + offset);
                    points = points + ' L'+ ((pointer) * step + step/2) + ' ' + ((vStep * 2) + offset);
                    points = points + ' L'+ ((pointer + 1) * step) + ' ' + ((vStep * 2) + offset);

                    aPoints = aPoints + ' L'+ ((pointer) * step + step/2) + ' ' + (svStep + sOffset);
                    aPoints = aPoints + ' L'+ ((pointer) * step + step/2) + ' ' + ((svStep * 2) + sOffset - 8);
                    aPoints = aPoints + ' L'+ ((pointer + 1) * step) + ' ' + ((svStep * 2) + sOffset - 8);
                } else {
                    points = points + ' L'+ ((pointer + 1) * step) + ' ' + ((vStep * 2) + offset);

                    aPoints = aPoints + ' L'+ ((pointer + 1) * step) + ' ' + ((svStep * 2) + sOffset - 8);
                }
                cLine = 2;
            } else {
                // Exit
                points = points + ' L'+ (pointer * step) + ' ' + (scoreH + startOffset - 72);
                aPoints = aPoints + ' L'+ (pointer * step) + ' ' + (scoreH + startOffset - 72);
                var exit_point = pointer;
                break
            }            
        }

        // console.log( points);

        // Draw a Circle at the starting point
        let sPoint = draw.circle(16);
        sPoint.move((starting_point * step -8 ), startOffset + 16);
        sPoint.attr('id', 'spoint-' + (player));

        // Draw a Triangle at the ending point
        // console.log("exit Point: "+exit_point);
        let ePoint = draw.polygon('0,0 16,0 8,16');
        ePoint.move((exit_point * step - 8), (scoreH + startOffset - 72));
        ePoint.attr('id', 'epoint-' + (player));
        
        let path = '';
        if( splitView ) {
            path = draw.path(aPoints);
        } else {
            path = draw.path(points);
        }        
        path.attr('id', 'path-' + (player));
        path.fill('none');
        path.stroke({ linecap: 'round', linejoin: 'round' });     
        
        // Save newly designed path
        let pP = [player-1, starting_point, points, aPoints, exit_point];
        pPaths.push(pP);

        // Add legend
        if (!legend) {
            var text = []
            for( let i=1; i <= steps + 1; i++) {
                text[i] = draw.text(i-1);
                text[i].amove( step*i, 20);
            }

            for( let i=0; i <= duration; i++) {
                text[i] = draw.text(i+'’');
                text[i].amove( step + timeStep*i, scoreH - 10);
            }
            legend = true;
        } 
        
        // Evaluate if it's possible to draw more path
        if ( (steps - exit_point + 1) >= steps / 3) {
            // Stay on the same player
            player--;
            // Pick next starting point
            draw_more = getRandomInt(exit_point+1, steps - 1);
        } else {
            draw_more = 0;
        }

        // Nothing else to draw => disable draw button
        if( player >= players ) {
            document.getElementById('draw-score').disabled = true;
        }
    } 

    function drawAlternate() {
        // Re Draw the path from saved data
        if( pPaths.length > 0 ) {
            draw.clear();

            var nPath = 0;
            var counter = setInterval( function() {
                let startOffset = (pPaths[nPath][0]+1) * 9;
                let sPoint = draw.circle(16);
                sPoint.move((pPaths[nPath][1] * step - 8 ), startOffset + 16);
                sPoint.attr('id', 'spoint-' + (pPaths[nPath][0]+1));
                let ePoint = draw.polygon('0,0 16,0 8,16');
                ePoint.move((pPaths[nPath][4] * step - 8), (scoreH + startOffset - 72));
                ePoint.attr('id', 'epoint-' + (pPaths[nPath][0]+1));
                let path = '';
                if( splitView ) {
                    path = draw.path(pPaths[nPath][3]);
                } else {
                    path = draw.path(pPaths[nPath][2]);
                }
                path.attr('id', 'path-' + (pPaths[nPath][0]+1));
                path.fill('none');
                path.stroke({ linecap: 'round', linejoin: 'round' });
                nPath++;
                if( nPath == pPaths.length) {
                    clearInterval( counter );
                }

            }, 80);

            // Add legend
        
            var text = []
            for( let i=1; i <= steps + 1; i++) {
                text[i] = draw.text(i-1);
                text[i].amove( step*i, 20);
            }

            for( let i=0; i <= duration; i++) {
                text[i] = draw.text(i+'’');
                text[i].amove( step + timeStep*i, scoreH - 10);
            }
            legend = true;
        

            // pPaths.forEach( p => {
            //     let startOffset = (p[0]+1) * 9;
            //     let sPoint = draw.circle(16);
            //     sPoint.move((p[1] * step - 8 ), startOffset + 16);
            //     sPoint.attr('id', 'spoint-' + (p[0]+1));
            //     let path = '';
            //     if( splitView ) {
            //         path = draw.path(p[3]);
            //     } else {
            //         path = draw.path(p[2]);
            //     }
            //     path.attr('id', 'path-' + (p[0]+1));
            //     path.fill('none');
            //     path.stroke({ linecap: 'round', linejoin: 'round' });
            // });
        }
    }
    
    function initPlay() {
        // Set up Animation
        // a_duration = (duration + duration/steps) * 1000;// For Testing
        a_duration = (duration + duration/steps) * 1000 * 60;
        mask = document.getElementById("mask").animate(
            [
            // keyframes
            { transform: "translateX(-" + (window.innerWidth - (window.innerWidth/(steps+2))) + "px)" },
            { transform: "translateX(0px)" },
            ],
            {
            // timing options
            duration: a_duration,
            iterations: 1,
            }
        );
        mask.pause();
        mask.onfinish = () => {
            mask.play();
            mask.pause();
            isPlaying = 0;
            document.getElementById('play-score').innerHTML = 'Play';
        };
        document.getElementById('play-score').disabled = false;
    }

    function clearScore() {
        draw.clear();
        player = 0;
        starting_player = getRandomInt(0, players);
        draw_more = 0;
        if (mask) {
            mask.cancel();
        }        
        animReady = 0;
        isPlaying = 0;
        legend = false;
        pPaths = [];
        document.getElementById('play-score').innerHTML = 'Play';
        document.getElementById('play-score').disabled = true;
        document.getElementById('draw-score').disabled = false;
        toggleFormElements(false);
    }

    function pickDuration() {
        duration = getRandomInt(3,13);
        document.getElementById('duration').value = duration;
        document.getElementById('max-steps').value = duration * 2;
        steps = duration * 2;
    }

    function pickSteps() {
        steps = getRandomInt(3, duration*2+1);
        document.getElementById('max-steps').value = steps;
    }

    function toggleFormElements(status = true) {
        document.getElementById('players').disabled = status;
        document.getElementById('duration').disabled = status;
        document.getElementById('pick-duration').disabled = status;
        document.getElementById('max-steps').disabled = status;
        document.getElementById('pick-steps').disabled = status;
        // document.getElementById('sine').disabled = status;
        // document.getElementById('square').disabled = status;
        // document.getElementById('triangle').disabled = status;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    document.getElementById("draw-score").onclick = function() {  
        
        if(draw_more > 0) {
            drawScore( draw_more );
        } else {
            drawScore();
        }

        toggleFormElements();
    };  
    
    document.getElementById("clear-score").onclick = function() {  
        clearScore();
    };  

    document.getElementById("play-score").onclick = function() {
        if( isPlaying ) {
            mask.pause();
            isPlaying = 0;
            this.innerHTML = 'Play';

        } else if (animReady) {
            var countDown = 2;
            var tl = document.getElementById("timeleft");
            this.innerHTML = 'Pause';
            tl.innerText = countDown+1;
            tl.classList.remove("hidden");
            tl.animate(
                [
                // keyframes
                { transform: "scale(3)", opacity: 1 },
                { transform: "scale(.5)", opacity: 0 },
                ],
                {
                // timing options
                duration: 1000,
                easing: "ease-in",
                iterations: 1,
                }
            );           

            // Start Countdown 
            var counter = setInterval( function() {
                countDown--;

                if( countDown < 0) {
                    clearInterval(counter);
                    tl.classList.add("hidden");
                    mask.play();
                    document.getElementById('stop-score').disabled = false;
                    isPlaying = 1;                    
                }

                tl.innerText = countDown+1;
                tl.animate(
                    [
                    // keyframes
                    { transform: "scale(3)", opacity: 1 },
                    { transform: "scale(.5)", opacity: 0 },
                    ],
                    {
                    // timing options
                    duration: 1000,
                    easing: "ease-in",
                    iterations: 1,
                    }
                );      
            }, 1000);            
        }           
    };

    document.getElementById("stop-score").onclick = function() {
        if( animReady ) {
            mask.cancel();
            isPlaying = 0;
            document.getElementById("play-score").innerHTML = 'Play';
            document.getElementById('stop-score').disabled = true;
            initPlay();
        }
    };
    
    document.getElementById("pick-duration").onclick = function() {  
        pickDuration();
        console.log(steps);
    };

    document.getElementById("pick-steps").onclick = function() {  
        pickSteps();
    };

    document.getElementById("players").addEventListener("change", (event) => {
        players = parseInt(document.getElementById('players').value);
        starting_player = getRandomInt(1, players + 1);
        console.log("Starting Player:" + starting_player);

        const legend_elements = document.querySelectorAll(".legend-element");
        for (var i = 0; i < legend_elements.length; i++) {
            i < players ? legend_elements[i].classList.remove("hidden") : legend_elements[i].classList.add("hidden");
        }
        const overlay_elements = document.querySelectorAll(".player-overlay");
        for (var i = 0; i < overlay_elements.length; i++) {
            i < players ? overlay_elements[i].classList.remove("hidden") : overlay_elements[i].classList.add("hidden");
        }
    });

    document.getElementById("duration").addEventListener("change", (event) => {
        duration = parseInt(document.getElementById('duration').value);
        if( parseInt(document.getElementById('max-steps').value) > duration * 2 ) {
            document.getElementById('max-steps').value = duration * 2;
        }
    });

    document.getElementById("max-steps").addEventListener("change", (event) => {
        steps = parseInt(document.getElementById('max-steps').value);
    });

    document.getElementById("sine").addEventListener("change", (event) => {
        if(!document.getElementById("triangle").checked && !document.getElementById("square").checked ) {
            document.getElementById("sine").checked = true;
        }
        sine = document.getElementById("sine").checked;
        console.log("Sine: " + sine);
    });

    document.getElementById("square").addEventListener("change", (event) => {
        if(!document.getElementById("triangle").checked && !document.getElementById("sine").checked ) {
            document.getElementById("square").checked = true;
        }
        square = document.getElementById("square").checked;
        console.log("Square: " + square);
    });

    document.getElementById("triangle").addEventListener("change", (event) => {
        if(!document.getElementById("square").checked && !document.getElementById("sine").checked ) {
            document.getElementById("triangle").checked = true;
        }
        triangle = document.getElementById("triangle").checked;
        console.log("Triangle: " + triangle);
    });

    document.getElementById("split").addEventListener("change", (event) => {
        splitView = document.getElementById("split").checked;
        document.getElementById("overlay").classList.toggle("hidden");
        drawAlternate();
        // console.log("Split View: " + splitView);
    });

    // Update SVG viewBox size on Window Resize
    window.onresize = function() {
        scoreW = document.getElementById('score').offsetWidth;
        scoreH = document.getElementById('score').offsetHeight;

        //Update SVG Viewbox
        document.getElementById("score-svg").setAttribute("viewBox", "0 0 "+ scoreW + " " + scoreH);
    }

    // Hide and show paths
    document.getElementById("player-1").addEventListener("mouseover",(event) => {
        let paths = document.querySelectorAll("#path-2, #spoint-2, #path-3, #spoint-3, #path-4, #spoint-4, #path-5, #spoint-5, #path-6, #spoint-6");
        for (let i = 0; i < paths.length; i++) {
            paths[i].classList.add("faded");
        }
    });

    document.getElementById("player-2").addEventListener("mouseover",(event) => {
        let paths = document.querySelectorAll("#path-1, #spoint-1, #path-3, #spoint-3, #path-4, #spoint-4, #path-5, #spoint-5, #path-6, #spoint-6");
        for (let i = 0; i < paths.length; i++) {
            paths[i].classList.add("faded");
        }
    });

    document.getElementById("player-3").addEventListener("mouseover",(event) => {
        let paths = document.querySelectorAll("#path-1, #spoint-1, #path-2, #spoint-2, #path-4, #spoint-4, #path-5, #spoint-5, #path-6, #spoint-6");
        for (let i = 0; i < paths.length; i++) {
            paths[i].classList.add("faded");
        }
    });

    document.getElementById("player-4").addEventListener("mouseover",(event) => {
        let paths = document.querySelectorAll("#path-1, #spoint-1, #path-2, #spoint-2, #path-3, #spoint-3, #path-5, #spoint-5, #path-6, #spoint-6");
        for (let i = 0; i < paths.length; i++) {
            paths[i].classList.add("faded");
        }
    });

    document.getElementById("player-5").addEventListener("mouseover",(event) => {
        let paths = document.querySelectorAll("#path-1, #spoint-1, #path-2, #spoint-2, #path-3, #spoint-3, #path-4, #spoint-4, #path-6, #spoint-6");
        for (let i = 0; i < paths.length; i++) {
            paths[i].classList.add("faded");
        }
    });

    document.getElementById("player-6").addEventListener("mouseover",(event) => {
        let paths = document.querySelectorAll("#path-1, #spoint-1, #path-2, #spoint-2, #path-3, #spoint-3, #path-4, #spoint-4, #path-5, #spoint-5");
        for (let i = 0; i < paths.length; i++) {
            paths[i].classList.add("faded");
        }
    });

    document.getElementById("stroke-width").addEventListener("change", (event) => {
        document.documentElement.style.setProperty('--stroke-width', parseInt(event.target.value));
    });

    document.getElementById("dark-mode").addEventListener("click", (event) => {
        document.body.classList.toggle("dark-mode");
    });

    let toggles = document.querySelectorAll("[id^=player-]");
    for (let i = 0; i < toggles.length; i++) {
        toggles[i].addEventListener("mouseout",(event) => {
            let paths = document.querySelectorAll("[id^=path-], [id^=spoint-]");
            for (let i = 0; i < paths.length; i++) {
                paths[i].classList.remove("faded");
            }
        });
    };
})