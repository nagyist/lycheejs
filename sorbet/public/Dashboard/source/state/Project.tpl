
<h1>Project "{{identifier}}"</h1>

<h2>Project Variants</h2>

<table>
	<tr>
		<th>Source</th>
		<td>folder</td>
		<td>
			<a href="{{root}}/source/" target="_blank">
				{{root}}/source/
			</a>
		</td>
		<td>-</td>
	</tr>
	<tr class="div"></tr>
	{{not builds_length}}
	<tr>
		<td class="center" colspan="4">
			No Build Variants in Package
		</td>
	</tr>
	{{/not builds_length}}
	{{for builds}}
	<tr>
		<td>Build&nbsp;({{builds[$].target}})</td>
		<td>{{builds[$].type}}</td>
		<td>
			<a href="{{builds[$].location}}" target="_blank">
				{{builds[$].location}}
			</a>
		</td>
		<td>{{builds[$].tags}}</td>
	</tr>
	{{/for builds}}
</table>

<h2>Project Details</h2>

<table>
	<tr>
		<th>Root</th>
		<td>
			<a href="{{root}}" target="_blank">
				{{root}}
			</a>
		</td>
	</tr>
	<tr>
		<th>Package</th>
		<td>
			<a href="{{package}}">
				{{package}}
			</a>
		</td>
	</tr>
	<tr>
		<th>Errors</th>
		<td>
			{{errors_length}}
			({{errors_percentage}})
		</td>
	</tr>
	<tr>
		<th>Visits</th>
		<td>{{visits_length}}</td>
	</tr>
	<tr>
		<td colspan="2">
			<div class="ui-graph" data-ui-graph="overview" data-width="480" data-height="160">
				<center>No Visit Metrics available</center>
			</div>
		</td>
	</tr>
	<tr>
		<td colspan="2">
			<div class="ui-graph" data-ui-graph="browsers" data-width="480" data-height="256">
				<center>No Browser Metrics available</center>
			</div>
		</td>
	</tr>
	<tr>
		<td colspan="2">
			<div class="ui-graph" data-ui-graph="devices" data-width="480" data-height="256">
				<center>No Device Metrics available</center>
			</div>
		</td>
	</tr>
</table>

<h2>Debugger Statistics</h2>

<table>
	<tr class="center">
		<th>Frequency</th>
		<th>Error Type</th>
		<th>Message</th>
		<th>Location</th>
		<th>Time</th>
	</tr>
	<tr class="div"></tr>
	{{not errors_length}}
	<tr>
		<td class="center" colspan="5">No Error Reports available</td>
	</tr>
	{{/not errors_length}}
	{{for errors}}
	<tr class="center">
		<td>{{errors[$].frequency}}</td>
		<td>{{errors[$].type}}</td>
		<td>{{errors[$].message}}</td>
		<td>
			<a href="{{errors[$].location}}">
				{{errors[$].file}}
			</a>
		</td>
		<td>{{errors[$].time}}</td>
	</tr>
	{{/for errors}}
</table>
 
