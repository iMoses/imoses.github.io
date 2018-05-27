// (function(canvas) {
//
//     // Initialization
//
//     var ctx = canvas.getContext('2d');
//
//     stretchCanvas();
//
//     window.addEventListener('resize', stretchCanvas);
//
//     var hexHeight,
//         hexRadius,
//         hexRectangleHeight,
//         hexRectangleWidth,
//         hexagonAngle = 0.523598776, // 30 degrees in radians
//         sideLength = 23,
//         boardWidth = 100,
//         boardHeight = 100;
//
//     hexHeight = Math.sin(hexagonAngle) * sideLength;
//     hexRadius = Math.cos(hexagonAngle) * sideLength;
//     hexRectangleHeight = sideLength + 2 * hexHeight;
//     hexRectangleWidth = 2 * hexRadius;
//
//
//     function stretchCanvas() {
//         canvas.width  = canvas.parentNode.offsetWidth;
//         canvas.height = canvas.parentNode.offsetHeight;
//     }
//
//
//
//
//     window.requestAnimationFrame(function handleFrame() {
//         drawBoard(ctx, boardWidth, boardHeight);
//         window.requestAnimationFrame(handleFrame);
//     });
//
//     function drawBoard(canvasContext, width, height) {
//         var i,
//             j;
//
//         ctx.fillStyle = "#000000";
//         ctx.strokeStyle = "#CCCCCC";
//         ctx.lineWidth = 1;
//
//         for(i = 0; i < width; ++i) {
//             for(j = 0; j < height; ++j) {
//                 drawHexagon(
//                     ctx,
//                     i * hexRectangleWidth + ((j % 2) * hexRadius),
//                     j * (sideLength + hexHeight),
//                     false
//                 );
//             }
//         }
//     }
//
//     function drawHexagon(canvasContext, x, y, fill) {
//         canvasContext.beginPath();
//         canvasContext.moveTo(x + hexRadius, y);
//         canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
//         canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
//         canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
//         canvasContext.lineTo(x, y + sideLength + hexHeight);
//         canvasContext.lineTo(x, y + hexHeight);
//         canvasContext.closePath();
//
//         fill ? canvasContext.fill() : canvasContext.stroke();
//     }
//
//
// })(document.getElementById('hex-animation'));