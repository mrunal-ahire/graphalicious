# Abstract

The *DataSource* type asynchronously provides raw data to the graph. Since the underlying source of the data may be mutable, a *DataSource* can emit a number of different events when it is modified.

# Overview & Terminology

The basic unit of data is a **data point**. Every data point includes a *y-axis value*, a number indicating how "high" the data point is. Some data points may also contain a second number, the *secondary y-axis value*. Secondary y-axis values are used to show a set of data below the primary set of data. Data points themselves do not contain x-axis values. A data point can be marked as **proper** or **improper**, but the meaning of these terms depends on the meaning of the underlying data.

Data points are indexed within a *DataSource*. At any time, a *DataSource* must be able to report how many data points it contains synchronously. A **chunk** represents a range of contiguous data points within a *DataSource*. A *DataSource* needn't be able to provide chunks of data synchronously&mdash;they can be fetched and returned through a callback.

Chunks should be able to persist through various kinds of modifications. For example, if a data point before a chunk is removed, the chunk should be updated so its start index is lower. If a data point within a chunk is deleted or added, the chunk should be resized and updated to reflect the change. However, it does not make sense to persist chunks through certain kinds of modifications. If one of these modifications occurs, the chunk can be **invalidated** (destroyed, for all intents and purposes). One should not attempt to access an invalid chunk.

Many graph types require access to two different chunks of data simultaneously: one chunk at the beginning of the data, and one whose position can change as the user scrolls. The reason for this is irrelevant for people implementing *DataSource*. For those of you who are interested, it is caused by the fact that y-axis labels resize dynamically.

Some graph types have x-axis labels. For these graphs types, the *DataSource* must be able to report the text of an x-axis labels given data point index. Unlike fetching data, fetching an x-axis label is a synchronous operation.

# The DataPoint type

Every data point has three fields:

 * *number* primary - the primary value of the data point.
 * *number* secondary - the secondary value of the data point, or -1 if no secondary value exists.
 * *boolean* proper - the data point is "proper".
 * *string* primaryTooltip - the tooltip text for the primary value. This may be undefined. If this is a string which begins with "!", then the tooltip is considered "improper". This usually means that it will be crossed-out by the *VisualStyle*. If this is a string with a leading backslash, the backslash will be omitted; this allows you to escape a leading "!".
 * *string* secondaryTooltip - the tooltip text for the secondary value. This may be undefined. See primaryTooltip for more info.

# The Chunk type

The *Chunk* datatype represents a range of *DataPoint* objects within a *DataSource*. A chunk implements the following methods:

 * *bool* valid() - check whether or not the chunk is valid. If the chunk is invalid, you should not call any other methods on it.
 * *int* getStartIndex() - get a number indicating the index of the first data point in this chunk.
 * *int* getLength() - get the number of data points in this chunk.
 * [DataPoint](#the-datapoint-type) getDataPoint(relativeIndex) - get the data point at an index relative to the start index of this chunk. For example, `getDataPoint(0)` would return the first data point in the chunk.

# Methods

Remember that a *DataSource* must be able to provide two chunks. In the context of a *DataSource* object, these are represented by a chunk index which may be 0 or 1.

A *DataSource* must implement the following methods:

 * *int* getLength() - get the total number of data points in the data source.
 * [Chunk](#the-chunk-type) getChunk(chunkIndex) - get one of the two chunks. This will return `null` if the chunk is currently available (i.e. it is still loading).
 * *string* getXAxisLabel(index) - get the x-axis label for the given data point index. If there are no x-axis labels, or if there is no label for this point, this should return null.
 * *void* fetchChunk(chunkIndex, start, length) - get a chunk and set it to chunk0 or chunk1 respectively. While the chunk is loading, the existing chunk will not be affected (i.e. it will not become null). The data source should automatically clip the start index and length to valid values. If a fetch operation was already underway for the given chunkIndex, it will be cancelled and replaced with this new fetch operation. Fetch operations will not be cancelled or changed when the data source is modified. For instance, if you fetch points in the range (5,5), and the 8th point is deleted while the fetch is underway, you will still get a chunk with range (5,5), but its points will be different than they would have been should the modification not have taken place. It is up to the DataSource's user to re-call fetchChunk() on data changes. However, when the DataSource is invalidated, it should cancel all fetch operations automatically.
 * *void* cancel(chunkIndex) - cancel a chunk0 or chunk1 fetch operation. This will not affect the current value of the chunk.
 * *bool* isLoadingChunk(chunkIndex) - get whether or not a new value for a chunk is being loaded.

# Events

A *DataSource* may emit the following events. Some of these events indicate remote changes, while others pertain to asynchronous fetching:

 * load(chunkIndex) - a chunk has finished loading.
 * error(chunkIndex) - a chunk could not be loaded.
 * delete(oldIndex) - a data point was deleted. This provides the index where the data point used to be.
 * insert(index) - a data point was added at the given index.
 * modify(index) - a data point was modified at a given index.
 * invalidate() - all the data has changed and should be reloaded completely.
