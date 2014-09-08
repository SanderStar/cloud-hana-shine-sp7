$.import("{{PACKAGE_NAME}}.services", "messages");
$.import("{{PACKAGE_NAME}}.services", "session");

var SESSIONINFO = $.{{PACKAGE_NAME}}.services.session;
var MESSAGES = $.{{PACKAGE_NAME}}.services.messages;

var aCmd = encodeURI($.request.parameters.get('cmd'));

switch (aCmd) {
case "synonym":
	generateSynonym();
	break;
case "getSessionInfo":
	SESSIONINFO.fillSessionInfo();
	break;	
default:
	$.response.status = $.net.http.BAD_REQUEST;
	$.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}

//Generate synonyms for currency conversion tables
function generateSynonym() {

	// open db connection
	var conn = $.db.getConnection();
	var i = 0;
	var body = '';
	var query = '';
	var pstmt;

	var tableArray = [ "T006", "T006A", "TCURC", "TCURF", "TCURN", "TCURR",
			"TCURT", "TCURV", "TCURW", "TCURX" ];
	for (i = 0; i < tableArray.length; i++) {
		try {
			query = 'DROP SYNONYM "{{SCHEMA_NAME}}"."' + tableArray[i]	+ '" ';
			pstmt = conn.prepareStatement(query);
			pstmt.execute();
			pstmt.close();
		} catch (e) {
		}
	}

	for (i = 0; i < tableArray.length; i++) {
		query = 'CREATE SYNONYM "{{SCHEMA_NAME}}"."'
				+ tableArray[i]
				+ '" FOR "_SYS_BIC"."{{PACKAGE_NAME}}.data::EPM.Conversions.'
				+ tableArray[i] + '"';
		pstmt = conn.prepareStatement(query);
		pstmt.execute();
		pstmt.close();
		body = body
				+ 'Created Synonym: "{{SCHEMA_NAME}}"."'
				+ tableArray[i]
				+ ' FOR "_SYS_BIC"."{{PACKAGE_NAME}}.data::'
				+ tableArray[i] + '" \n';
	}

	conn.commit();

	$.response.status = $.net.http.OK;
	$.response.setBody(body);

	// close db connection
	conn.close();
}