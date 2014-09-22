
<h2>Texture</h2>

<div class="scrollarea">
	<img src="{{preview}}">
</div>

<h2>Settings</h2>

<table class="fixed">
	{{for dimensions}}
	<tr>
		<td>{{dimensions[$].type}}</td>
		<td>{{dimensions[$].value}}</td>
	</tr>
	{{/for dimensions}}
	<tr class="div"></tr>
	<tr>
		<td>Map</td>
		<td><pre class="javascript">{{map}}</pre></td>
	</tr>
	<tr>
		<td>States</td>
		<td><pre class="javascript">{{states}}</pre></td>
	</tr>
	<tr class="div"></tr>
	<tr>
		<td class="right" colspan="2">
			<button class="download" data-identifier="Sprite.png">Download Sprite.png</button>
			<button class="download" data-identifier="Sprite.json">Download Sprite.json</button>
		</td>
	</tr>
</table>

