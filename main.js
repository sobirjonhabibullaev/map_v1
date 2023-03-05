var scaleLineControl = new ol.control.ScaleLine();
var projection = ol.proj.get($("button")[0].value);

// Icon 
function createStyle(src, img) {
  return new ol.style.Style({
    image: new ol.style.Icon(
      /** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 0.96],
        src: src,
        img: img,
        imgSize: img ? [img.width, img.height] : undefined,
      })
    ),
  });
}

var iconFeature = new ol.Feature(
  new ol.geom.Point([54439566.69638371, 4179007.67946651])
);
iconFeature.set(
  "style",
  createStyle(
    "https://openlayers.org/en/v3.20.1/examples/data/icon.png",
    undefined 
  )
);

// Map
var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    new ol.layer.Vector({
      style: function (feature) {
        return feature.get("style");
      },
      source: new ol.source.Vector({ features: [iconFeature] }),
    })
  ],
  target: "map",
  controls: ol.control
    .defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false,
      }),
    })
    .extend([scaleLineControl]),
  view: new ol.View({
    // center: [54300862.82493453, 4337230.843078675],
    center: ol.proj.transform(
      [54300862.82493453, 4337230.843078675],
      "EPSG:3857",
      projection
    ),
    zoom: 7,
  }),
});

// Scaling Options
var unitsSelect = document.getElementById("units");
function onChange() {
  scaleLineControl.setUnits(unitsSelect.value);
}
unitsSelect.addEventListener("change", onChange);
onChange();

// EPSG:3857 & EPSG:4326
$("button").click(function prjection(){onChangeProjection(this);})

function onChangeProjection(e) {
  const currentView = map.getView();
//   const currentProjection = currentView.get();
  const currentProjection = ol.proj.get(currentView.o.hb);
  console.log(currentView);
  const newProjection = ol.proj.get(e.value);
  const currentResolution = currentView.getResolution();
  const currentCenter = currentView.getCenter();
  const currentRotation = currentView.getRotation();
  const newCenter = ol.proj.transform(currentCenter, currentProjection, newProjection);
  const currentMPU = currentProjection.getMetersPerUnit();
  const newMPU = newProjection.getMetersPerUnit();
  const currentPointResolution =
    ol.proj.getPointResolution(currentProjection, 1 / currentMPU, currentCenter, "m") *
    currentMPU;
  const newPointResolution =
    ol.proj.getPointResolution(newProjection, 1 / newMPU, newCenter, "m") * newMPU;
  const newResolution =
    (currentResolution * currentPointResolution) / newPointResolution;
  const newView = new ol.View({
    center: newCenter,
    resolution: newResolution,
    rotation: currentRotation,
    projection: newProjection,
  });
  map.setView(newView);
}

// Coordinates
let mousePositionCtrl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.toStringHDMS,
  projection: "EPSG:3857",
  className: "custom-mouse-position",
  target: document.getElementById("mouse-position"),
  undefinedHTML: "&nbsp;",
});
map.addControl(mousePositionCtrl);


// icon
var selectStyle = {};
var select = new ol.interaction.Select({
  style: function (feature) {
    var image = feature.get("style").getImage().getImage();
    if (!selectStyle[image.src]) {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, image.width, image.height);
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      var data = imageData.data;
      for (var i = 0, ii = data.length; i < ii; i = i + (i % 4 == 2 ? 2 : 1)) {
        data[i] = 255 - data[i];
      }
      context.putImageData(imageData, 0, 0);
      selectStyle[image.src] = createStyle(undefined, canvas);
    }
    return selectStyle[image.src];
  },
});
map.addInteraction(select);
 


// map.on('click', function(e){console.log(e.coordinate)})
