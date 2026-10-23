const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const IS_DEV = process.env.NODE_ENV === 'dev';

const config = {
  mode: IS_DEV ? 'development' : 'production',
  devtool: IS_DEV ? 'eval' : 'source-map',

  entry: {
    main: path.join(__dirname, 'src', 'ts', 'index.ts'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      three: path.resolve(__dirname, 'node_modules/three/build/three.module.js'),
    },
  },
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-class-properties'],
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'] },
            },
          },
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: 8192 },
        },
        generator: {
          filename: 'assets/textures/[name][ext]',
        },
      },
      { test: /node_modules/, loader: 'ify-loader' },
      {
        test: /\.(glsl|frag|vert)$/,
        include: [path.join(__dirname, 'src', 'ts', 'shaders')],
        exclude: /node_modules/,
        use: [
          'raw-loader',
          {
            loader: 'glslify-loader',
            options: {
              transform: [
                ['glslify-hex', { 'option-1': true, 'option-2': 42 }],
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: './src/assets', to: 'assets' }],
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'windows.jQuery': 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: IS_DEV ? 'css/[name].css' : 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].css',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'src'),
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true,
        },
      },
    },
    minimizer: ['...'],
  },
};

if (!IS_DEV) {
  const TerserPlugin = require('terser-webpack-plugin');
  const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

  config.optimization.minimizer = [
    new TerserPlugin(),
    new CssMinimizerPlugin(),
  ];
}

const files = glob.sync('./src/templates/*.html');

files.forEach(file => {
  config.plugins.push(
    new HtmlWebPackPlugin({
      filename: path.basename(file),
      template: file,
      favicon: path.resolve(__dirname, './src/assets/favicon.ico'),
      minify: !IS_DEV,
    })
  );
});

module.exports = config;
