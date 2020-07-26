const path = require("path");

module.exports = {
	mode: "production",
	entry: {
		app: "./doc-gen/scripts/main.ts",
	},
	resolve: {
		extensions: [".ts", ".js"],
		modules: [__dirname, "node_modules"],
	},
	output: {
		globalObject: "self",
		filename: "[name].bundle.js",
		publicPath: "./assets/",
		path: path.resolve(process.env.npm_config_output, "assets"),
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
				options: {
					configFile: path.resolve(__dirname, "./tsconfig.json"),
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
};
