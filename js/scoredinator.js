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
    var mask = null;
    var isPlaying = 0;
    var animReady = 0;
    var redrawCounter = 0;
    
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
                var exit_y = scoreH + startOffset - 72;
                points = points + ' L'+ (pointer * step) + ' ' + exit_y;
                aPoints = aPoints + ' L'+ (pointer * step) + ' ' + exit_y;
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
        ePoint.move((exit_point * step - 8), exit_y);
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
        let pP = [player-1, starting_point, points, aPoints, exit_point, exit_y, startOffset + 32];
        pPaths.push(pP);
        updateURL();

        // Add legend
        if (!legend) {
            drawLegend();
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
            clearInterval( redrawCounter );

            var nPath = 0;
            redrawCounter = setInterval( function() {
                let sPoint = draw.circle(16);
                sPoint.move((pPaths[nPath][1] * step - 8 ), pPaths[nPath][6] - 16);
                sPoint.attr('id', 'spoint-' + (pPaths[nPath][0]+1));
                let ePoint = draw.polygon('0,0 16,0 8,16');
                ePoint.move((pPaths[nPath][4] * step - 8), pPaths[nPath][5]);
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
                    clearInterval( redrawCounter );
                }

            }, 80);

            // Add legend
            drawLegend();
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
        clearInterval( redrawCounter );
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
        updateURL();
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

    function drawLegend() {
        var text = []
        for( let i=1; i <= steps + 1; i++) {
            text[i] = draw.text(i-1);
            text[i].amove( step*i, 20);
        }

        for( let i=0; i <= duration; i++) {
            text[i] = draw.text(i+'’');
            text[i].amove( step + timeStep*i, scoreH - 10);
        }
    }

    function rescaleScore(newW, newH) {
        if (!newW || !newH || !scoreW || !scoreH) return false;

        var sx = newW / scoreW;
        var sy = newH / scoreH;
        scoreW = newW;
        scoreH = newH;
        document.getElementById("score-svg").setAttribute("viewBox", "0 0 " + scoreW + " " + scoreH);
        step = scoreW / (steps + 2);
        timeStep = (scoreW - 2 * step) / duration;

        if (pPaths.length > 0) {
            pPaths.forEach(function(p) {
                p[2] = scalePath(p[2], sx, sy);
                p[3] = scalePath(p[3], sx, sy);
                p[5] = p[5] * sy;
                p[6] = p[6] * sy;
            });
            drawAlternate();
        }

        return true;
    }

    function updateURL() {
        var hash = '';
        if (pPaths.length > 0) {
            var data = {
                w: scoreW,
                h: scoreH,
                p: players,
                d: duration,
                s: steps,
                si: sine,
                sq: square,
                tr: triangle,
                sp: splitView,
                sw: parseInt(document.getElementById('stroke-width').value),
                paths: pPaths
            };
            hash = '#' + btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        try {
            history.replaceState(null, '', location.pathname + location.search + hash);
        } catch (e) {
            location.hash = hash;
        }
    }

    function restoreFromURL() {
        if (location.hash.length < 2) return false;

        var data;
        try {
            var b64 = location.hash.slice(1).replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) b64 += '=';
            data = JSON.parse(atob(b64));
        } catch (e) {
            return false;
        }
        if (!data || !data.p || !data.d || !data.s || !data.w || !data.h || !Array.isArray(data.paths) || data.paths.length === 0) {
            return false;
        }

        players = data.p;
        document.getElementById('players').value = players;
        duration = data.d;
        document.getElementById('duration').value = duration;
        steps = data.s;
        document.getElementById('max-steps').value = steps;
        sine = !!data.si;
        square = !!data.sq;
        triangle = !!data.tr;
        document.getElementById('sine').checked = sine;
        document.getElementById('square').checked = square;
        document.getElementById('triangle').checked = triangle;
        splitView = !!data.sp;
        document.getElementById('split').checked = splitView;
        document.getElementById('overlay').classList.toggle('hidden', !splitView);
        if (data.sw) {
            document.getElementById('stroke-width').value = data.sw;
            document.documentElement.style.setProperty('--stroke-width', data.sw);
        }

        const legend_elements = document.querySelectorAll(".legend-element");
        for (let i = 0; i < legend_elements.length; i++) {
            i < players ? legend_elements[i].classList.remove("hidden") : legend_elements[i].classList.add("hidden");
        }
        const overlay_elements = document.querySelectorAll(".player-overlay");
        for (let i = 0; i < overlay_elements.length; i++) {
            i < players ? overlay_elements[i].classList.remove("hidden") : overlay_elements[i].classList.add("hidden");
        }

        pPaths = data.paths;
        scoreW = data.w;
        scoreH = data.h;
        rescaleScore(document.getElementById('score').offsetWidth, document.getElementById('score').offsetHeight);

        player = players;
        starting_player = getRandomInt(0, players);
        initPlay();
        animReady = 1;
        toggleFormElements(true);
        document.getElementById('draw-score').disabled = true;
        document.getElementById('stop-score').disabled = true;

        return true;
    }

    function scalePath(d, sx, sy) {
        return d.replace(/([MLC])([^MLC]*)/g, function(match, cmd, coords) {
            var nums = coords.match(/-?\d*\.?\d+/g);
            if (!nums) return match;
            var scaled = [];
            for (var i = 0; i < nums.length; i += 2) {
                scaled.push((parseFloat(nums[i]) * sx).toFixed(2));
                scaled.push((parseFloat(nums[i + 1]) * sy).toFixed(2));
            }
            return cmd + ' ' + scaled.join(' ');
        });
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

    ["sine", "square", "triangle"].forEach(function(name) {
        document.getElementById(name).addEventListener("change", (event) => {
            if( !document.getElementById("sine").checked && !document.getElementById("square").checked && !document.getElementById("triangle").checked ) {
                document.getElementById(name).checked = true;
            }
            sine = document.getElementById("sine").checked;
            square = document.getElementById("square").checked;
            triangle = document.getElementById("triangle").checked;
        });
    });

    document.getElementById("split").addEventListener("change", (event) => {
        splitView = document.getElementById("split").checked;
        document.getElementById("overlay").classList.toggle("hidden");
        drawAlternate();
        updateURL();
        // console.log("Split View: " + splitView);
    });

    // Redraw the score on window resize
    var resizeTimer = 0;
    window.addEventListener("resize", function() {
        clearTimeout( resizeTimer );
        resizeTimer = setTimeout( function() {
            if (rescaleScore(document.getElementById('score').offsetWidth, document.getElementById('score').offsetHeight) && animReady) {
                var progress = mask.currentTime / a_duration;
                mask.cancel();
                initPlay();
                mask.currentTime = progress * a_duration;
                if (isPlaying) {
                    mask.play();
                }
            }
        }, 150);
    });

    // Hide and show paths
    for (let i = 1; i <= 6; i++) {
        document.getElementById("player-" + i).addEventListener("mouseover", (event) => {
            let paths = document.querySelectorAll("[id^=path-], [id^=spoint-]");
            for (let j = 0; j < paths.length; j++) {
                if (!paths[j].id.endsWith("-" + i)) {
                    paths[j].classList.add("faded");
                }
            }
        });

        document.getElementById("player-" + i).addEventListener("mouseout", (event) => {
            let paths = document.querySelectorAll("[id^=path-], [id^=spoint-]");
            for (let j = 0; j < paths.length; j++) {
                paths[j].classList.remove("faded");
            }
        });
    }

    document.getElementById("stroke-width").addEventListener("change", (event) => {
        document.documentElement.style.setProperty('--stroke-width', parseInt(event.target.value));
        updateURL();
    });

    document.getElementById("dark-mode").addEventListener("click", (event) => {
        document.body.classList.toggle("dark-mode");
    });

    restoreFromURL();
})