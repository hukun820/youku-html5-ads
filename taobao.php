<?php
class TaoBao  {

	private $_dataPath = 'data/';
	private $_suffix = '.csv';
	private $_suffix_old = '.txt';

	private function getDateType($str) {
		$regex_long = '/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/';
		$regex_hmis = '/^\d{1,2}:\d{1,2}:\d{1,2}$/';
		$matchs = array();
		if (preg_match($regex_long, $str, $matchs))
			return 'long';
		if (preg_match($regex_hmis, $str, $matchs))
			return 'hmis';
		return 'notypes';
	}

	private function getPosData($str) {
		$empty_data = array(
			'x' => 0,
			'y' => 0,
			'width' => 0,
			'height' => 0,
			'maxWidth' => 0,
			'maxHeight' => 0
		);
		if (!$str) return $empty_data;
		$data = explode('_', $str);
		return array(
			'x' => !empty($data[0]) ? $data[0]*1 : 0,
			'y' => !empty($data[1]) ? $data[1]*1 : 0,
			'width' => !empty($data[2]) ? $data[2]*1 : 0,
			'height' => !empty($data[3]) ? $data[3]*1 : 0,
			'maxWidth' => !empty($data[4]) ? $data[4]*1 : 0,
			'maxHeight' => !empty($data[5]) ? $data[5]*1 : 0
		);
	}

	private function time2stamp($str) {
		if (!$str) return 0;
		$type = $this->getDateType($str);
		if ($type != 'hmis') return 0;
		$source = '2000-10-10';
		return strtotime($source.' '.$str) - strtotime($source);
	}

	private function parseData($data) {
		$data = explode("\r\n", $data);
		if (!$data) return false;
		$arr = array();
		foreach($data as $k=>$v) {
			$arrData = explode(',', $v);
			if (count($arrData)<6) continue;
			$temp = array(
				'time' => $this->time2stamp($arrData[0])*1000,
				'pos' => !empty($arrData[1]) ? $this->getPosData($arrData[1]) : $this->getPosData(''),
				'title' => !empty($arrData[2]) ? $arrData[2] : '',
				'image' => !empty($arrData[3]) ? $arrData[3] : '',
				'link' => !empty($arrData[4]) ? $arrData[4] : '',
				'type' => !empty($arrData[5]) ? $arrData[5] : ''
			);
			$arr[] = $temp;
		}
		return $arr;
	}

	public function getData($vid) {
		$file_path = $this->_dataPath.$vid.$this->_suffix;
		$file_path_old = $this->_dataPath.$vid.$this->_suffix_old;
		if (file_exists($file_path)) {
			$data = file_get_contents($file_path);
			return $this->parseData($data);
		}
		if (file_exists($file_path_old)) {
			$data = file_get_contents($file_path_old);
			return json_decode($data);
		}
		return false;
	}
}
?>
