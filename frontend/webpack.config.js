const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.tsx',
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      'process/browser': require.resolve('process/browser'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts?|js?|jsx?|tsx?)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', { "runtime": "automatic" }],
              '@babel/preset-typescript'],
          }
        }
      },
      // {
      //   enforce: 'pre',
      //   test: /\.(ts?|js?|jsx?|tsx?)$/,
      //   loader: 'source-map-loader'
      // },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
  devServer: {
    host: '0.0.0.0',
    compress: true,
  }
};
