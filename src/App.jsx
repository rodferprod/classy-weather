import React from "react";

function getWeatherIcon(wmoCode) {
    const icons = new Map([
        [[0], "☀️"],
        [[1], "🌤"],
        [[2], "⛅️"],
        [[3], "☁️"],
        [[45, 48], "🌫"],
        [[51, 56, 61, 66, 80], "🌦"],
        [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
        [[71, 73, 75, 77, 85, 86], "🌨"],
        [[95], "🌩"],
        [[96, 99], "⛈"],
    ]);
    const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
    if (!arr) return "NOT FOUND";
    return icons.get(arr);
}

function convertToFlag(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
    return new Intl.DateTimeFormat("en", {
        weekday: "short",
    }).format(new Date(dateStr));
}

class App extends React.Component {

    state = {
        location: "",
        isLoading: false,
        displayLocation: '',
        weather: {}
    }

    fetchWeather = async () => {
        if (this.state.location.length < 2) {
            // Cleaning the weather state if the location field have
            // less than 2 letters, unmounting Weather component
            return this.setState({ weather: {} });
        }
        try {
            this.setState({ isLoading: true });

            // 1) Getting location (geocoding)
            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
            );
            const geoData = await geoRes.json();
            console.log(geoData);

            if (!geoData.results) throw new Error("Location not found");

            const {
                latitude,
                longitude,
                timezone,
                name,
                country_code
            } = geoData.results.at(0);

            this.setState({ displayLocation: `${name} ${convertToFlag(country_code)}` });

            // 2) Getting actual weather
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
            );
            const weatherData = await weatherRes.json();
            this.setState({ weather: weatherData.daily });
        } catch (err) {
            console.error(err);
        } finally {
            this.setState({ isLoading: false });
        }
    }

    setLocation = (ev) => this.setState({ location: ev.target.value });

    // It's like useEffect with empty array of dependencies []
    // This will be called just on initial render
    componentDidMount() {
        //this.fetchWeather();

        // Getting the location from localStorage and setting the location
        // and it'll make an update and trigger the fetch method.
        this.setState({ location: localStorage.getItem('location') || "" });
    }

    // It's like useEffect with location as dependency [location]
    // This will not be called on initial render, but every re-render
    componentDidUpdate(prevProps, prevState) {
        // Checking if the previous location is different to the actual
        if (this.state.location !== prevState.location) {
            // Here we're fetching weather for each changes in the location field.
            this.fetchWeather();
            // Saving the location on localStorage while it changes
            localStorage.setItem('location', this.state.location);
        }
    }

    render() {
        return (
            <div className="app">
                <h1>Classy Weather</h1>
                <Input location={this.state.location} onChangeLocation={this.setLocation} />
                {/*<button onClick={this.fetchWeather}>Get weather</button>*/}
                {this.state.isLoading && <div className="loader">Loading...</div>}

                {this.state.weather.weathercode && (
                    <Weather
                        weather={this.state.weather}
                        location={this.state.displayLocation}
                    />
                )}
            </div>
        );
    }
}

class Input extends React.Component {
    render() {
        return (
            <div>
                <input type="text" value={this.props.location} onChange={this.props.onChangeLocation} placeholder="Search from location" />
            </div>
        )
    }
}

class Weather extends React.Component {
    componentWillUnmount() {
        console.log('Weather component unmount!')
    }
    render() {
        const {
            temperature_2m_max: max,
            temperature_2m_min: min,
            time: dates,
            weathercode: codes
        } = this.props.weather
        return (
            <div>
                <h2>Weather {this.props.location}</h2>
                <ul className="weather">
                    {dates.map((date, index) => {
                        return (
                            <Day
                                date={date}
                                max={max.at(index)}
                                min={min.at(index)}
                                code={codes.at(index)}
                                key={date}
                                isToday={index === 0}
                            />
                        );
                    })}
                </ul>
            </div>
        )
    }
}

class Day extends React.Component {
    render() {
        const { date, max, min, code, isToday } = this.props;
        return (
            <li className="day">
                <span>{getWeatherIcon(code)}</span>
                <p>{isToday ? 'Today' : formatDay(date)}</p>
                <p>
                    {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
                </p>
                <p style={{ fontSize: 'small', marginTop: '-10px' }}>
                    min&nbsp;&nbsp;&mdash;&nbsp;&nbsp;max
                </p>
            </li>
        )
    }
}

export default App;