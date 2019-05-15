# Quirk-canvas

Quirk is a totally free, open source javascript library designed to perform editable canvas directly in a web browser. 

<img width="1792" alt="Screenshot" src="https://user-images.githubusercontent.com/8134988/57783793-0dc9ad80-772f-11e9-9d9f-e196c2045faa.png">

### 3. Usage

```JavaScript

<script language="javascript" type="text/javascript">
    var quirk = null;
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof Quirk === "undefined") {
            return;
        }
        quirk = new Quirk("drawingCanvas");
        quirk.color = "#cc4499";
        quirk.init();
        quirk.on("OnCanvasSerialized", function (e) { document.getElementById('source').value = e.detail.source; });
        quirk.on("OnDeserialized", function (e) { document.getElementById('HistoryCount').value = e.detail; });
        quirk.on("OnDataChanged", function (e)
        {
            var data = JSON.stringify
                ({
                    "Token": document.getElementById('Token').value,
                    "Value": encodeURIComponent(e.detail.data)
                });
         
            quirk.applyNetworkRequest('/api/History', 'POST', "value=" + data)
                .then(res => document.getElementById('HistoryCount').value = res.replace(/["']/g, ""))
                .catch(res => alert(res));
        });
    }, false);
    
   
</script>

```

