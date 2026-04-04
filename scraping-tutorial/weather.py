import requests
import pyttsx3

# ---------------- GET WEATHER ---------------- #
city = "Mumbai"  # You can change this

url = f"https://wttr.in/{city}?format=j1"
response = requests.get(url)
data = response.json()

# Extract info
temp = data['current_condition'][0]['temp_C']
weather_desc = data['current_condition'][0]['weatherDesc'][0]['value']

# Create sentence
weather_text = f"The current weather in {city} is {weather_desc} with a temperature of {temp} degrees Celsius."

print(weather_text)

# ---------------- SPEAK ---------------- #
engine = pyttsx3.init()

# Adjust voice (optional)
engine.setProperty('rate', 170)   # speed
engine.setProperty('volume', 1.0)  # volume

engine.say(weather_text)
engine.runAndWait()
