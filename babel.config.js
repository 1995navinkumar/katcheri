module.exports = function (api) {
	api.cache(true);
	return {
		"presets": [[
			"@babel/preset-env", {
				"useBuiltIns": "entry"
			}],
			"@babel/preset-react"],
		"plugins": [
			["@babel/plugin-transform-runtime",
				{
					"regenerator": true
				}
			]
		],
	}
}
