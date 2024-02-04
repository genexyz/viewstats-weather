import React from "react";
import {WeatherApiResponse, WeatherForecast} from "@/types";

import {capitalizeFirstLetter, capitalizeFirstLetterPerWord} from "@/lib/utils";

import Humiditycon from "./icons/humidity";
import PressureIcon from "./icons/pressure";
import WindIcon from "./icons/wind";
import styles from "./weather-chart.module.css";
import WeatherIcon from "./weather-icon";

const getDailyForecasts = (
  forecasts: WeatherForecast[],
  currentDate: string,
) => {
  const days: {[key: string]: WeatherForecast[]} = {};
  forecasts.forEach((forecast) => {
    const day = forecast.dt_txt.split(" ")[0]; // Get date as 'YYYY-MM-DD'
    if (!days[day]) days[day] = [];
    days[day].push(forecast);
  });

  const dailyForecasts = Object.values(days)
    .map((forecastsForDay) => {
      const middayForecast = forecastsForDay.reduce((prev, curr) => {
        const prevDistance = Math.abs(
          new Date(`${prev.dt_txt}`).getHours() - 12,
        );
        const currDistance = Math.abs(
          new Date(`${curr.dt_txt}`).getHours() - 12,
        );
        return prevDistance < currDistance ? prev : curr;
      });

      const minTemp = Math.min(
        ...forecastsForDay.map((forecast) => forecast.main.temp_min),
      );
      const maxTemp = Math.max(
        ...forecastsForDay.map((forecast) => forecast.main.temp_max),
      );

      return {
        ...middayForecast,
        main: {
          ...middayForecast.main,
          temp_min: minTemp,
          temp_max: maxTemp,
        },
      };
    })
    .filter((forecast) => forecast.dt_txt.split(" ")[0] !== currentDate);

  return dailyForecasts.slice(0, 5);
};

const WeatherChart = ({
  weatherData,
  city,
}: {
  weatherData: WeatherApiResponse;
  city: string;
}) => {
  const currentWeather = weatherData.list[0];
  const currentDate = currentWeather.dt_txt.split(" ")[0]; // Get current date as 'YYYY-MM-DD'
  const dailyForecasts = getDailyForecasts(
    weatherData.list.slice(1),
    currentDate,
  );

  return (
    <div className={styles.weatherChart}>
      <div className={styles.currentWeather}>
        <div className={styles.currentWeatherHeader}>
          <div className={styles.currentWeatherTitle}>
            <h2>{capitalizeFirstLetterPerWord(city)}</h2>
            <p>{new Date(currentWeather.dt * 1000).toLocaleString()}</p>
          </div>
          <div className={styles.currentWeatherDetail}>
            <h3>{currentWeather.main.temp.toFixed()}°</h3>
            <div>
              <p className={styles.currentWeatherDetailDescription}>
                {capitalizeFirstLetter(currentWeather.weather[0].description)}
              </p>
              <p className={styles.currentWeatherDetailFeelsLike}>
                Feels like: {currentWeather.main.feels_like.toFixed()}°{" "}
              </p>
            </div>
            <WeatherIcon code={currentWeather.weather[0].id} />
          </div>
        </div>

        <div className={styles.currentWeatherExtras}>
          <div>
            <PressureIcon className="icon" />
            <p>Pressure: {currentWeather.main.pressure} hPa</p>
          </div>
          <div>
            <Humiditycon className="icon" />
            <p>Humidity: {currentWeather.main.humidity}%</p>
          </div>
          <div>
            <WindIcon className="icon" />
            <p>Wind: {currentWeather.wind.speed} m/s</p>
          </div>
        </div>
      </div>

      <div className={styles.forecast}>
        {dailyForecasts.map((forecast) => (
          <div key={forecast.dt} className={styles.forecastDay}>
            <p className={styles.date}>
              {new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
            <div className={styles.weatherIcon}>
              <WeatherIcon code={forecast.weather[0].id} />
            </div>
            <p>{forecast.weather[0].main}</p>
            <p className={styles.temperature}>
              {Math.round(forecast.main.temp_max)}° /{" "}
              {Math.round(forecast.main.temp_min)}°
            </p>
          </div>
        ))}
        {dailyForecasts.map((forecast) => (
          <div
            key={`${forecast.dt}-mobile`}
            className={styles.forecastDayMobile}
          >
            <div className={styles.cardLeft}>
              <div className={styles.weatherIconMobile}>
                <WeatherIcon code={forecast.weather[0].id} />
              </div>
              <div className={styles.dateMainMobile}>
                <p className={styles.date}>
                  {new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p>{forecast.weather[0].main}</p>
              </div>
            </div>
            <div className={styles.temperatureMobile}>
              {Math.round(forecast.main.temp_max)}° /{" "}
              {Math.round(forecast.main.temp_min)}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherChart;
