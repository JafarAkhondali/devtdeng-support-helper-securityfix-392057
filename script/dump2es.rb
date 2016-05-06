#! /usr/bin/env ruby

require 'nokogiri'
require 'open-uri'
require 'json'


ELASTICSEARCH_KB_ENDPOINT = 'http://10.65.127.241:9200/kb/fulltext/'
ELASTICSEARCH_DOC_ENDPOINT = 'http://10.65.127.241:9200/doc/fulltext/'

# curl -XPUT 'http://<elastic search server IP>:9200/doc/fulltext/1' -d '
# {"url": "...", “title": "...", "content": "..."}'
def write2elasticsearch(es_endpoint, index, url, title, content)
	uri = URI(es_endpoint + index.to_s)
	req = Net::HTTP::Put.new(uri, initheader = {'Content-Type' =>'application/json'})
	req.body = {:url=> url, :title=> title, :content=> content}.to_json
	res = Net::HTTP.start(uri.hostname, uri.port) do |http|
		http.request(req)
	end
end

# Title XPath: //*[@id="js-content"]/h1
# Cotent XPath: //*[@id="js-content"]
def html_parser_doc(url, index)
	puts "-----------"
	page = Nokogiri::HTML(open(url, 'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.91 Safari/537.36'))
	title = page.xpath('//*[@id="js-content"]/h1').text
	content = page.xpath('//*[@id="js-content"]').text
	puts url
	puts title
	write2elasticsearch(ELASTICSEARCH_DOC_ENDPOINT, index, url, title, content)
end

# Title XPath: /html/body/main/article/header/h1
# Cotent XPath: /html/body/main/article/div/div[1]
def html_parser_kb(url, index)
	puts "-----------"
	page = Nokogiri::HTML(open(url, 'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.91 Safari/537.36'))
	title = page.xpath('/html/body/main/article/header/h1').text
	content = page.xpath('/html/body/main/article/div/div[1]').text
	puts url
	puts title
	write2elasticsearch(ELASTICSEARCH_KB_ENDPOINT, index, url, title, content)
end

File.open('./pcf_doc_list.txt').each.with_index do |line, index|
	html_parser_doc(line, index)
end

File.open('./pcf_kb_list.txt').each.with_index do |line, index|
	html_parser_kb(line, index)
end