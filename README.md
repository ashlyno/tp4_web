# tp4-interactivity

For the fourth technical progress check-in, you'll be using the [D3](https://d3js.org/) framework to create an interactive multi-series line chart. In doing so, you'll demonstrate a strong familiarity with the following skills:

- Advanced knowledge of the **data-join**
- Ability to use functions to compute `path` elements for lines
- Assigning `mouseover` and `mouseout` events to add interactivity to your chart

## Preview
Complete example of visualization.
![Complete example](./imgs/complete-example.png)

## Dataset
This assignment uses a dataset from UN Data that shows carbon dioxide emissions between 1990 and 2014 for multiple countries ([data here](http://data.un.org/Data.aspx?d=GHG&f=seriesID:CO2)).

(From UN Data): the carbon dioxide emissions are given as units of:
> Carbon Dioxide (CO2) Emissions without Land Use, Land-Use Change and Forestry (LULUCF), in kilotonne CO2 equivalent)

## Instructions
Instructions are included below, as well as in-line in your `js/script.js` file. In order to focus on the data-join and hover events, much of the code has already been written for you.

### Function for calculating line path
- Use the `d3.line()` function to create a function `line` for drawing your `path` elements. You'll need to leverage the `.x` and `.y` methods to describe how to compute the path from your data

### Function for drawing lines
In this section, you'll **carefully** perform a data-join. As demonstrated in class, you'll want to create the following effect:

- **Entering** lines transition in from _left to right_
- **Updating** elements update their position in a smooth motion
- **Exiting** elements transition out from _right to left_

To accomplish this, I suggest you set attributes **separately** for entering/updating/exiting elements (i.e., no `merge`). However, I suggest you first get your `path` elements on the screen (**entering**), move on to the [hover](#hover) section, then come back an put your finishing touches on the transitions.

#### Entering
- Perform a data-join between a selection of `path` elements in your `g` and your data that you pass into the `draw` function
- For each new (entering) element, append a `path` element to your `g`
- Use your `line` function to set the `d` property of your path. This will describe how to _draw_ it on the screen
- Set your `fill` to `none` and stroke-width to  `1.5` (these are path **attributes**)
- To create your transition, you'll need to set your `stroke-dasharray` to `LENGTH LENGTH` (with a space in-between), where `LENGTH` is the length _of each path_. To get each path's length (in pixels), you can use the following syntax inside a function:
    `d3.select(this).node().getTotalLength()`
- Set your `stroke-dashoffset` to the total length of each path (see last step). This essentially creates a dashed line whose dash length (`stroke-dasharray`) is the length of your line. Then, you shift it (`stroke-dashoffset`) by the length of your path so that you begin with an _empty dash_.

#### Updating

- Set your `stroke-dasharray` to `none`
- Transition your `d` attribute using your `line` function to update the position appropriately
- Update the `stroke` of each path

#### Exiting

- To transition _right to left_, transition your `stroke-dashoffset` to `-LENGTH` (negative value of the length of each path)
- Reset your `stroke-dasharray` to `LENGTH LENGTH`

### Hover
Your `drawHover` function will take in a `year` as a parameter, and then leverage a data-join to place circles and text over the appropriate locations on the graph. This requires that you filter down your data to the closest year to the hover (using `d3.bisect`), then add/remove circles from the screen. 

- Use `d3.bisector` to define a function (`bisector`) that can find the closest datapoint to your year: 
    ```javascript
        var bisector = d3.bisector(function(d, x) {
            return +d.year - x;
        }).left;
    ```
- Get hover data by using the `bisector` function to find the nearest data-point to your hover event. You'll need to: 
    - **Iterate** through your `selectedData` array
    - **Sort** the `values` of each country by `+year`
    - **Return** the element closest to your `year` variable. Hint:
        `dat.values[bisector(dat.values, year)]`

Once you have your data, you can simply do the following to add hover:
- Do a data-join (enter, update, exit) to draw `circle` elements over your lines
- Do a data-join (enter, update, exit) to draw `text` elements over your lines

### Event listener
You'll need to assign event listeners to your `overlay` element to listen to your hovers:

- On **mousemove**, detect the mouse location (`d3.mouse(this)`)and use `xScale.invert` to get the _data value_ that corresponds to the _pixel value_
- On **mouseout**, remove all `circle` and `text` elements from the `g` element

## References
- [UN Data](http://data.un.org/Data.aspx?d=GHG&f=seriesID:CO2)
- [D3](https://d3js.org/)
- [D3 - Line chart](https://bl.ocks.org/mbostock/3883245)
- [D3 - Multi series line chart](https://bl.ocks.org/mbostock/3884955)
- [D3 Book Chapter](https://info474-s17.github.io/book/introduction-to-d3-js.html)
