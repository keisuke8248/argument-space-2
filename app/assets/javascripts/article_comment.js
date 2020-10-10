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
                              <div class="fas fa-thumbs-up__letter">good</div>
                            </i>
                          </button>
                        </form>
                        <div class="count_good">
                        0
                        </div>
                      </div>
                      <div class="comment__evaluation__form">
                        <form class="evaluation_form_bad" action="/evaluations/bad" accept-charset="UTF-8" method="post">
                          <input name="utf8" type="hidden" value="✓"></input>
                          <input value=${comment.article_id} type="hidden" name="article_id" id="article_id"></input>
                          <input value=${comment.id} type="hidden" name="comment_id" id="comment_id"></input>
                          <button name="button" type="submit" class="bad_btn">
                            <i class="fas fa-thumbs-down">
                              <div class="fas fa-thumbs-down__letter">bad</div>
                            </i>
                          </button>
                        </form>
                        <div class="count_bad">
                        0
                        </div>
                      </div>
                    </div>
                    <div class="comment__reply" id="hide">表示
                      <div class="comment__reply__content" data-index=${comment.index}></div>
                    </div>
                  </div>`
    return html;
  }

  var searchingReply = function() {
    var comment = $('.comment__text').not('.reply');
    var length = comment.length;
    for (var i=1; i<=length; i++) {  //e(コメント)のテキストからアンカーを検索
      comment.each(function(I, e) {
        var reply = $(`.comment__reply__content[data-index=${i}]`);
        if (I === 0) {
          reply.html('');
        }
        var text = $(e).text();
        var pattern = new RegExp(`>>${i}`);
        var result = pattern.test(text);
        if (result === true) {
          let commentClass = $(e).parent('.comment')
          let appendComment = commentClass.clone();
          appendComment.addClass('reply');
          $(e).addClass('reply');
          reply.append(appendComment);
        }
      });
    }
  };

  searchingReply();

  $('.comment__index').on('click', function(){
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
      if ($.isArray(data)) {
        var insertHTML = '';
        $.each(data, function(i, comment) {
          insertHTML += buildHTML(comment);
        });
      } else {
        insertHTML = buildHTML(data);
      }
      
      $('.new_comment').append(insertHTML);
      $('.text_area').val('');
      $('.submit_comment').prop('disabled', false);
      searchingReply();
    })
    .fail(function(){
      alert('error');
    })
  })


  var reloadComments = function() {
    var last_comment_id = $('.comment:last').data("comment-id");
    var article_id = $('.article__title').data("article-id");
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
    })
    .fail(function() {
      alert('error');
    });
  };
  
  if (document.location.href.match(/\/articles\/\d+\/article_comments/)) {
    //setInterval(reloadComments, 300000);
    //searchingReply();
  }


  $(document).on('click','.comment__reply#hide', function() {
    var reply = $(this).children('.comment__reply__content');
    reply.show();
    $(this).removeAttr('id');
    $(this).attr('id', 'show');
  })
  $(document).on('click','.comment__reply#show', function(){
    var reply = $(this).children('.comment__reply__content');
    reply.hide();
    $(this).removeAttr('id');
    $(this).attr('id', 'hide');
  });
});

//コメント表示として隠れて表示されているため、first()が思った場所に機能しない
//隠れコメントには別のidを付与するなどで対処したい