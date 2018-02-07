<%@ language="javascript"%>
<!DOCTYPE html>
<html>
<head>
	<%
	function jsproc() {
		Response.Write("bla");
	}
	%>
</head>

<body>
	<%jsproc()%>
</body>
</html> 