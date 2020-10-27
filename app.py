from flask import Flask, render_template

app = Flask(__name__, static_url_path="")

@app.route("/", methods=["GET"])
def index():
    return render_template("templates/index.html")

@app.route("/<name>", methods=["GET"])
def set(name):
    return render_template(name + '.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)