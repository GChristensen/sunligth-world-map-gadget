
// Map dimensions
var mapWidth = 360;
var mapHeight = 180;

function adjustParameters()
{
	// How many degrees in one pixel?
	pixelDegW = 360 / mapWidth;
	pixelDegH = 180 / mapHeight;

	// Offset from 180 deg. of the most left longitude on the map grid
	// in degrees
	edgeOffset = 9.5;

	// Map grid origin
	centerDegW = (mapWidth / 2) * pixelDegW - edgeOffset;
	centerDegH = (mapHeight / 2) * pixelDegH;
}

// Pixel coordinates
function pixelX(deg)
{
	var offset = (deg < centerDegW)
		? (centerDegW - deg)
		: (360 - deg + centerDegW);

	return offset / pixelDegW; // in 360 deg. space
}

function pixelY(deg)
{
	return (centerDegH - deg) / pixelDegH;
}

// Pixel latitude and longitude
function pixelLambda(x)
{
	var deg = x * pixelDegW;
	return (deg < centerDegW)
		? (centerDegW - deg)
		: (360 - deg + centerDegW); // in 360 deg. space
}

function pixelPhi(y, lambda)
{
	return centerDegH - y * pixelDegH;
}

// Canvas circle helper
function drawCircle(ctx, cx, cy, r, fill)
{
	ctx.beginPath();  
	ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();	
	ctx.stroke();
} 

function init()
{
	adjustParameters();

	mapImage = new Image(); 
	mapImage.onload = function () { drawDayNightMap(mapImage) };
	mapImage.src = "map.png";
	
}


function drawDayNightMap(mapImage)
{
    var map = document.getElementById("map");

	map.width = mapWidth;
	map.height = mapHeight;
	var ctx = map.getContext("2d");	

	ctx.drawImage(mapImage, 0, 0);

	performCalculations(new Date());

	var northSun = DECsun >= 0;
	var startFrom = northSun? 0: (mapHeight - 1);
	var pstop = function (y) { return northSun? (y < mapHeight): (y >= 0); };
	var inc = northSun? 1: -1;
	
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

	for (var x = 0; x < mapWidth; ++x)
		for (var y = startFrom; pstop(y); y += inc)
		{			
			var lambda = pixelLambda(x);
			var phi = pixelPhi(y) + 0.5 * (northSun? -1: 1);

			var centralAngle = sind(phi) * sind(DECsun) 
							 + cosd(phi) * cosd(DECsun) * cosd(GHAsun - lambda);
			centralAngle = Math.acos(centralAngle);
			 
			if (centralAngle > Math.PI / 2)
			{                                              
				var rectTop = northSun? y: 0;
				var rectHeight = northSun? mapHeight - rectTop: y + 1;
                
				ctx.fillRect(x, rectTop, 1, rectHeight);                                             				
				break;
			}    
		}                          
	
	drawCircle(ctx, pixelX(GHAsun), pixelY(DECsun), 5, "#FFFF00");
	drawCircle(ctx, pixelX(GHAmoon), pixelY(DECmoon), 5, "#FFFFFF");
}		
