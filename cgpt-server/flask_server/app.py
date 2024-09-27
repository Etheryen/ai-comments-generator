from flask import Flask, request, jsonify
import time
import os
import random

# Tuples used for finding index of string sent by POST
vibes = ("positive", "neutral", "negative")
registers = ("formal", "informal")

universal_usernames = [
    "@Emma_Starlet",
    "@John.Doe_27",
    "@Sophie_Swift",
    "@Mark.Jones_42",
    "@Lily-Sparkle",
    "@Oliver_Pulse",
    "@AvaJohnson_18",
    "@Daniel-White_89",
    "@Ella_Sunbeam",
    "@Ryan.Miller_33",
    "@Mia_Joyful",
    "@Lucas_Smith_56",
    "@Grace_Delight",
    "@Ethan_Moonlight",
    "@Chloe-Clark_24",
    "@AlexanderSmith_7",
    "@Sophia_Glow",
    "@Noah_Grant_29",
    "@Emily_Shine",
    "@Liam_Jenkins_48",
    "@Charlotte-Woods_15",
    "@William.Davis_67",
    "@Ava.Sanders_22",
    "@Henry_Knight_51",
    "@Amelia_Baker_84",
    "@James_Waves",
    "@Ella-Blissful",
    "@Logan-Storm",
    "@Mason-Ember",
    "@Sophia-Clark_37",
    "@Olivia.Moore_99",
    "@Chloe_Wonder",
    "@Ethan_Wild_23",
    "@Emma.Storm_18",
    "@Ava_Rainbow_42",
    "@Daniel_Sunrise",
    "@Grace.Evergreen",
    "@Lily_Aurora_88",
    "@Oliver_Sky_77",
    "@Sophie.Sunset",
    "@Noah_Twilight",
    "@Mia_Mystic_11",
    "@Lucas_Serendipity",
    "@Ella.Dusk_27",
    "@Ryan.Midnight",
    "@Chloe_Starlight",
    "@Henry_Whisper_15",
    "@Amelia_Silhouette",
    "@James_Luminary",
    "@Ava.Solar_22",
    "@Emma_Lunar_51",
    "@Sophie.Cosmic_84",
    "@Mia_Starshine",
    "@Oliver_Spectrum",
    "@Grace.Astral_99",
    "@Ethan_Galaxy",
    "@Lily.Quasar_18",
    "@Charlotte_Blaze_63",
    "@William.Spark_67",
    "@Ava_Vortex_42",
    "@Logan.Infinity",
    "@Sophia.Galactic_37",
    "@Noah_Nebula_29",
    "@Emily_Orbit_99",
    "@Liam.Cosmos_48",
    "@Ella.Solaris_15",
    "@Mia_Nova_88",
    "@Oliver.Eclipse_77",
    "@Chloe_Celestial",
    "@Alexander.Planet_11",
    "@Sophie_Supernova",
    "@Noah.Stellar_27",
    "@Ethan.Pulsar_18",
    "@Emma_Glow_22",
    "@Ava_Luminous_51",
    "@Lily.Radiant_84",
    "@Olivia.Lustrous_99",
    "@Mason_Sparkler",
    "@Emily.Radiance_63",
    "@Ella.Glint_37",
    "@Noah_Sheen_29",
    "@Sophie_Spark_99",
    "@Amelia_Ray_48",
    "@Oliver.Beam_18",
    "@Ethan_Flare_77",
    "@Mia.Luminesce_42",
    "@Liam_Glitter_15",
    "@Chloe.Aura_51",
    "@Henry_Gleam_22",
    "@Ava.Bright_84",
    "@Logan_Shimmer_67",
    "@Sophia_Radiant_99",
    "@Noah_Effulgent",
    "@Emma_Glisten_48",
    "@Lily.Dazzle_37",
    "@Olivia_Light_29",
    "@Ella_Sparkle_18",
    "@Mia_Eclat_22",
    "@Oliver.Splendor_51",
    "@Sophie.Radiance_84",
    "@Noah.Brilliance_99",
    "@Chloe.Lustrous_63",
    "@Henry.Aureate_37",
    "@Amelia_Ethereal_29",
    "@James_Lustrum_99",
    "@Ava_Luminance_48",
    "@Logan.Radiance_22",
    "@Emily.Luminary_84",
    "@Sophia_Lambent_67",
    "@Oliver.Flash_99",
    "@Mia_Resplendent",
    "@Ella.Sparkling_48",
    "@Noah_Lustrum_37",
    "@Lily.Aureole_29",
    "@Charlotte_Lustre_18",
    "@William.Glow_51",
    "@Ava_Effervescent",
    "@Logan.Lucent_84",
    "@Sophie.Limpid_67",
    "@Noah.Effulgence_99",
    "@Mia.Sparkler_48",
    "@Ella.Luminosity_22"
]

def split_messages(messageString):
    individual_strings = messageString.split('\n')
    # Removing any empty strings from the list
    individual_strings = list(filter(None, individual_strings))
    # Removing numbers and quotes from each line
    individual_strings = [line.split('. ', 1)[1].strip('\"') for line in individual_strings if '. ' in line]
    return individual_strings

def get_random_username():
    return random.choice(universal_usernames)

def model_response_to_array_of_dictionaries(messageString):
    messagesArray = split_messages(messageString)
    resultArray = []

    for message in messagesArray:
        resultArray.append({"username": get_random_username(), "message": message})

    return resultArray


# Create flask object
app = Flask(__name__)


# Create functionality of Flask object
@app.route("/api/comments", methods=['POST'])
def index():
    # Get password from console
    correctPassword = os.environ.get("PASSWORD")

    # Get password from POST
    password = request.headers["password"]

    # End if passwords are not the same
    if password != correctPassword:
        return jsonify({"error": "Unauthorized"}), 401

    # Get input from POST
    data = request.json

    # Translate strings to numbers
    vibe = vibes.index(data["type"])
    register = registers.index(data["register"])
    
    print("Running query:", data['query'])

    # String for executing CGS (Comments Generating Script)
    modelQuery = f"python3 /home/cgpt/mistral/run.py {data['commentsNumber']} {vibe} {register} \"{data['query']}\""

    print("modelQuery:", modelQuery)
    
    start_time = time.time()

    # Execute CGS and read PRINTED string output
    frompy = os.popen(modelQuery).read()

    end_time = time.time()

    print("Query finished:", data['query'])
    print("Time elapsed: ", end_time - start_time, "seconds\n")

    output = model_response_to_array_of_dictionaries(frompy)
    # Process the output of CGS and send to JS
    return jsonify(output)


# Execute Flask object
if __name__ == "__main__":
    app.run()
