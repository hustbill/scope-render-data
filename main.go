package main

import (

	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	log "github.com/Sirupsen/logrus"
	"net/url"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"runtime"
	"github.com/ugorji/go/codec"


	"github.com/gorilla/mux"

	"./app"
	//"./test/fixture"

	"./test/fixture"
)

func main() {
	TestAll()
}


func topologyServer() *httptest.Server {
	//router := mux.NewRouter().SkipClean(true)
	router := mux.NewRouter()
	app.RegisterTopologyRoutes(router, app.StaticCollector(fixture.Report))
	return httptest.NewServer(router)
}


// checkGet does a GET and returns the response and the body
func checkGet(ts *httptest.Server, path string) (*http.Response, []byte) {
	return checkRequest(ts, "GET", path, nil)
}

// checkRequest does a 'method'-request (e.g. 'GET') and returns the response and the body
func checkRequest( ts *httptest.Server, method, path string, body []byte) (*http.Response, []byte) {
	fullPath := ts.URL + path
	var bodyReader io.Reader
	if len(body) > 0 {
		bodyReader = bytes.NewReader(body)
	}
	req, err := http.NewRequest(method, fullPath, bodyReader)
	if err != nil {
		log.Fatalf("Error getting %s: %s %s", method, path, err)
	}
	req.Header.Set("Content-Type", "application/msgpack")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error getting %s %s: %s", method, path, err)
	}

	body, err = ioutil.ReadAll(res.Body)
	res.Body.Close()
	if err != nil {
		log.Fatalf("%s %s body read error: %s", method, path, err)
	}
	return res, body
}

// getRawJSON GETs a file, checks it is JSON, and returns the non-parsed body
func getRawJSON(ts *httptest.Server, path string) []byte {
	res, body := checkGet( ts, path)

	_, file, line, _ := runtime.Caller(1)
	file = filepath.Base(file)
	if res.StatusCode != 200 {
		log.Fatalf("%s:%d: Expected status %d, got %d. Path: %s", file, line, 200, res.StatusCode, path)
	}

	foundCtype := res.Header.Get("content-type")
	if foundCtype != "application/json" {
		log.Errorf("%s:%d: Wrong Content-type for JSON: %s", file, line, foundCtype)
	}

	if len(body) == 0 {
		log.Errorf("%s:%d: No response body", file, line)
	}
	// fmt.Printf("Body: %s", body)

	return body
}


func TestAll() {
	ts := topologyServer()

	defer ts.Close()

	body := getRawJSON(ts, "/api/topology")
	var topologies []app.APITopologyDesc
	decoder := codec.NewDecoderBytes(body, &codec.JsonHandle{})
	if err := decoder.Decode(&topologies); err != nil {
		log.Fatalf("JSON parse error: %s", err)
	}

	getTopology := func(topologyURL string) {
		body := getRawJSON(ts, topologyURL)
		var topology app.APITopology
		decoder := codec.NewDecoderBytes(body, &codec.JsonHandle{})
		if err := decoder.Decode(&topology); err != nil {
			log.Fatalf("JSON parse error: %s", err)
		}

		for _, node := range topology.Nodes {
			body := getRawJSON(ts, fmt.Sprintf("%s/%s", topologyURL, url.QueryEscape(node.ID)))
			var node app.APINode
			decoder = codec.NewDecoderBytes(body, &codec.JsonHandle{})
			if err := decoder.Decode(&node); err != nil {
				log.Fatalf("JSON parse error: %s", err)
			}
		}
	}

	for _, topology := range topologies {
		getTopology(topology.URL)

		for _, subTopology := range topology.SubTopologies {
			getTopology(subTopology.URL)
		}
	}
}

