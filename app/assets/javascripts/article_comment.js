$(function(){
  
  function buildHTML(comment){

      const html = `<div class="comment" data-comment-id=${comment.id}>
                      <div class="comment__detail">
                        <div class="comment__index" data-index="${comment.index}">
                          ${comment.index}:
                        </div>
                        <div class="comment__detail__nickname">
                          ${comment.nickname}
                        </div>
                        <div class="comment__detail__date">
                          ${comment.date}
                        </div>
                      </div>
                      <div class="comment__text" data-index=${comment.index}>
                        ${comment.text}
                      </div>
                      <div class="comment__evaluation">
                        <div class="comment__evaluation__form">
                          <form class="evaluation_form_good" action="/evaluations/good" accept-charset="UTF-8" method="post">
                            <input name="utf8" type="hidden" value="✓"></input>
                            <input value=${comment.article_id} type="hidden" name="article_id" id="article_id"></input>
                            <input value=${comment.id} type="hidden" name="comment_id" id="comment_id"></input>
                            <button name="button" type="submit" class="good_btn">
                              <i class="fas fa-thumbs-up">
                                <span class="count_good">0</span>
                              </i>
                            </button>
                          </form>
                        </div>
                        <div class="comment__evaluation__form">
                          <form class="evaluation_form_bad" action="/evaluations/bad" accept-charset="UTF-8" method="post">
                            <input name="utf8" type="hidden" value="✓"></input>
                            <input value=${comment.article_id} type="hidden" name="article_id" id="article_id"></input>
                            <input value=${comment.id} type="hidden" name="comment_id" id="comment_id"></input>
                            <button name="button" type="submit" class="bad_btn">
                              <i class="fas fa-thumbs-down">
                                <span class="count_bad">0</span>
                              </i>
                            </button>
                          </form>
                        </div>
                      </div>
                      <div class="comment__reply" id="hide">
                        <div class="comment__reply__btn">
                          <div class"comment__reply__text">返信</div>
                          <div class"comment__reply__count" data-index=${comment.index}>0</div>
                        </div>
                      <div class="comment__reply__content" data-index=${comment.index}></div>
                    </div>
                  </div>
                  <div class="new_comment"></div>`
    return html;
  }

  var searchingReply = function() {

    var comment = $('.comment__text').not('.reply');
    var length = comment.length;
    var replyCount;

    //i: >>iのアンカーが存在するか確認
    //I I+1個めのコメントのテキストを調べているの意味
    for (var i=1; i<=length; i++) {  //e(コメント)のテキストからアンカーを検索
      comment.each(function(I, e) {
        var reply = $(`.comment__reply__content[data-index=${i}]`);

        if (I === 0) {
          reply.html('');
          replyCount = 0;
        }
        //debugger;
        var text = $(e).text();
        let anchor = `>>${i}`
        var pattern = new RegExp(anchor + "(?!\\d+)");
        var result = pattern.test(text);

        if (result === true) {
          //debugger;
          replyCount++;
          let commentClass = $(e).parent('.comment')//テキストの親のコメントクラス
          let commentToBeAppended = commentClass.clone();//クローン
          commentToBeAppended.find('.comment').addClass('reply');//replyクラスを付与して返信であることを明示
          //commentToBeAppended.find('.comment__reply__content').addClass('reply');
          //$(e).addClass('reply');
          reply.append(commentToBeAppended);
          
          //返信数が更新されたら何かアニメーションをつけたい
        }

        if (length === I+1) {
          //debugger;
          let Class = $(`.comment__reply__count[data-index=${i}]`);
          Class.html(replyCount);
        }
      });
    }
  };


  $(document).on('click', '.comment__index', function(){
    var textarea = $('.text_area')
    var index = $(this).data('index');
    var inputVal = '>>' + `${index}` +'\n';
    textarea.val(textarea.val() + inputVal);
  });
  
  $('#new_article_comment').on('submit', function(e){
    e.preventDefault();
    let formData = new FormData(this);
    let last_comment_id = $('.comment:last').data("comment-id");
    formData.append('last_comment_id', last_comment_id);
    let url = $(this).attr('action');
    $.ajax({
      url: url,
      type: "POST",
      data: formData,
      dataType: "JSON",
      processData: false,
      contentType: false
    })
    .done(function(data){
      if ($.isArray(data.comment1)) {
        var insertHTML = '';
        $.each(data.comment1, function(i, comment) {
          insertHTML += buildHTML(comment);
        });
      } else {
        insertHTML = buildHTML(data);
        let anchor = data.anchor
        $(document).ready(function() {
          $.each(anchor, function(i, e) {
            let Class = $(`.comment__reply__count[data-index=${e}]`);
            var val = Class.text();
            val++;
            Class.text(val);
        })
      });
      }
      
      var comment = $('.new_comment:last');
      comment.append(insertHTML);
      comment.hide();
      comment.fadeIn(200)
      $('.text_area').val('');
      $('.submit_comment').prop('disabled', false);
    })
    .fail(function(){
      alert('error');
    })
  })


  var reloadComments = function() {
    var last_comment_id = $('.comment:last').data("comment-id");
    var article_id = $('.article__header__title').data("article-id");
    $.ajax({
      url: "/articles/" + article_id + "/article_comments/api",
      type: 'get',
      dataType: 'json',
      data: {last_comment_id: last_comment_id}
    })
    .done(function(data) {
      let insertHTML = '';
      $.each(data, function(i, comment) {
        insertHTML += buildHTML(comment);
      });
      $('.new_comment').append(insertHTML);
      if ( insertHTML !== '') {
      }
    })
    .fail(function() {
      alert('error');
    });
  };
  
  if (document.location.href.match(/\/articles\/\d+\/article_comments/)) {
    //setInterval(reloadComments, 7000);
  }


  $(document).on('click','.comment__reply#hide', function() {
    var reply = $(this).find('.comment__reply__content');
    reply.fadeIn(300);
    $(this).removeAttr('id');
    $(this).attr('id', 'show');
  })
  $(document).on('click','.comment__reply#show', function(){
    var reply = $(this).find('.comment__reply__content');
    reply.fadeOut(300);
    $(this).removeAttr('id');
    $(this).attr('id', 'hide');
  });

  $("a[href^='#page-top']").on('click', function(){
    $('html, body').animate({
      scrollTop: 0
    },0);
    return false;
  });

  $("a[href^='#page-bottom']").on('click', function(){
    $('html, body').animate({
      scrollTop: $(document).height()
    },0);
    return false;
  });
});

