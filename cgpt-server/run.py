import sys
from ctransformers import AutoModelForCausalLM, AutoConfig, Config

conf = AutoConfig(Config(temperature=0.8, repetition_penalty=1.1, batch_size=52, max_new_tokens=1024, context_length=4096))

llm = AutoModelForCausalLM.from_pretrained("/home/etheryen/dev/mistral-test/mistral-7b-instruct-v0.1.Q4_K_M.gguf", model_type = "mistral", config = conf)

character = ["positive", "neutral", "negative"]
register = ["formal", "informal"]

comment_count = sys.argv[1]
comment_character = character[int(sys.argv[2])]
comment_register = register[int(sys.argv[3])]
post_content = sys.argv[4]

prompt = f"Generate me {comment_count} long socialmedia-like {comment_character} comments with emojis, that are {comment_register} and directly respond to the content of this post: {post_content}"

input_prompt = f"<s>[INST]{prompt}[/INST]"

output = llm(input_prompt, temperature = 0.7,
            repetition_penalty = 1.15,
            max_new_tokens = 16384)

print(output)
