import React from "react";
import {render} from "react-dom";
import "./sass/main.scss";
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.autocomplete = this.event = this.infowindow = this.marker = this.map = this.place = this.address = null;
    this.onSelected = this.onSelected.bind(this);
    this.useStrictBounds = this.useStrictBounds.bind(this);
    this.setupClickListener = this.setupClickListener.bind(this);
    this.placeChanged = this.placeChanged.bind(this);

  }
  componentDidMount() {
setTimeout(function(){
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('pac-input'));
    this.event = this.autocomplete.addListener('place_changed', this.onSelected);
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: -33.8688,
        lng: 151.2195
      },
      zoom: 13
    });
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.refs.pacCard.current);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    this.autocomplete.bindTo('bounds', this.map);

    // Set the data fields to return when the user selects a place.
    this.autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

    this.infowindow = new google.maps.InfoWindow();
    this.infowindow.setContent(this.refs.infowindowContent);
    this.marker = new google.maps.Marker({
      map: this.map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    this.event = this.autocomplete.addListener('place_changed', this.placeChanged);

    this.setupClickListener('changetype-all', []);
    this.setupClickListener('changetype-address', ['address']);
    this.setupClickListener('changetype-establishment', ['establishment']);
    this.setupClickListener('changetype-geocode', ['geocode']);

    this.event = this.autocomplete.addListener('use-strict-bounds', this.useStrictBounds);
  }.bind(this), 500);
  }

  componentWillUnmount() {
    this.event.remove();
  }
  useStrictBounds() {
    console.log('Checkbox clicked! New state=' + this.checked);
    this.autocomplete.setOptions({strictBounds: this.checked});
  }
  onSelected() {
    console.log(this.autocomplete.getPlace());
  }
  setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      this.autocomplete.setTypes(types);
    });
  }
  placeChanged() {
    this.infowindow.close();
    this.marker.setVisible(false);
    this.place = this.autocomplete.getPlace();

    if (!this.place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + this.place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (this.place.geometry.viewport) {
      this.map.fitBounds(this.place.geometry.viewport);
    } else {
      this.map.setCenter(this.place.geometry.location);
      this.map.setZoom(17); // Why 17? Because it looks good.
    }
    this.marker.setPosition(this.place.geometry.location);
    this.marker.setVisible(true);

    if (this.place.address_components) {
      this.address = [
        (this.place.address_components[0] && this.place.address_components[0].short_name || ''),
        (this.place.address_components[1] && this.place.address_components[1].short_name || ''),
        (this.place.address_components[2] && this.place.address_components[2].short_name || '')
      ].join(' ');
    }

    this.refs.infowindowContent.children['place-icon'].src = this.place.icon;
    this.refs.infowindowContent.children['place-name'].textContent = this.place.name;
    this.refs.infowindowContent.children['place-address'].textContent = this.address;
    this.infowindow.open(this.map, this.marker);

  }
  render() {
    return (<React.Fragment>
      <div className="pac-card" id="pac-card" ref="pacCard">
        <div>
          <div id="title">
            Autocomplete search
          </div>
          <div id="type-selector" className="pac-controls">
            <input type="radio" name="type" id="changetype-all" defaultChecked="defaultChecked"/>
            <label htmlFor="changetype-all">All</label>

            <input type="radio" name="type" id="changetype-establishment"/>
            <label htmlFor="changetype-establishment">Establishments</label>

            <input type="radio" name="type" id="changetype-address"/>
            <label htmlFor="changetype-address">Addresses</label>

            <input type="radio" name="type" id="changetype-geocode"/>
            <label htmlFor="changetype-geocode">Geocodes</label>
          </div>
          <div id="strict-bounds-selector" className="pac-controls">
            <input type="checkbox" id="use-strict-bounds" defaultValue=""/>
            <label htmlFor="use-strict-bounds">Strict Bounds</label>
          </div>
        </div>
        <div id="pac-container">
          <input id="pac-input" type="text" placeholder="Enter a location"/>
        </div>
      </div>
      <div id="map"></div>
      <div id="infowindow-content" ref="infowindowContent">
        <img src="" width="16" height="16" id="place-icon"/>
        <span id="place-name" className="title"></span><br/>
        <span id="place-address"></span>
      </div>
    </React.Fragment>)
  }
}
render(<App/>, document.getElementById("app"));
