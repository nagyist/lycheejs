
<h1>Font Editor</h1>

<form onsubmit="ui.trigger('form input, form select', 'MAIN', 'submit'); return false;">
<table>
	<tr>
		<th>Family</th>
		<td><input type="text" name="family" value="{{family}}"></td>
	</tr>
	<tr>
		<th>Style</th>
		<td>
			<select name="style">
				<option value="normal" selected>normal</option>
				<option value="bold">bold</option>
				<option value="italic">italic</option>
			</select>
		</td>
	</tr>
	<tr>
		<th>Size</th>
		<td><input type="range" name="size" min="16" max="64" value="{{size}}"></td>
	</tr>
	<tr>
		<th>Spacing</th>
		<td><input type="range" name="spacing" min="8" max="64" value="{{spacing}}"></td>
	</tr>
	<tr>
		<th>Color</th>
		<td><input type="text" name="color" pattern="\#[0-9a-f]{6}" value="{{color}}"></td>
	</tr>
	<tr>
		<th>Outline</th>
		<td><input type="range" name="outline" min="0" max="16" value="{{outline}}"></td>
	</tr>
	<tr>
		<th>Outline Color</th>
		<td><input type="text" name="outlinecolor" pattern="\#[0-9a-f]{6}" value="{{outlinecolor}}"></td>
	</tr>
	<tr class="div"></tr>
	<tr>
		<td class="right" colspan="2">
			<input type="submit" value="Generate">
		</td>
	</tr>
</table>
</form>

